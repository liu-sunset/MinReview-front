import { defineStore } from 'pinia';
import { dishApi, campusApi, canteenApi, floorApi } from '../api/services';
import { ElMessage } from 'element-plus';

interface Campus {
  id: number;
  name: string;
  address: string;
  status: number;
}

interface Canteen {
  id: number;
  name: string;
  campusId: number;
  campusName: string;
  address: string;
  status: number;
  floorCount: number;
}

interface Floor {
  id: number;
  name: string;
  canteenId: number;
  canteenName: string;
  floorNumber: number;
  description: string;
  dishCount: number;
}

interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
  floorId: number;
  floorName: string;
  canteenId: number;
  canteenName: string;
  campusId: number;
  campusName: string;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  status: number;
  updateTime: string;
}

export const useDishStore = defineStore('dish', {
  state: () => ({
    campusList: [] as Campus[],
    canteenList: [] as Canteen[],
    floorList: [] as Floor[],
    dishList: [] as Dish[],
    total: 0,
    currentPage: 1,
    pageSize: 10,
    selectedCampusId: null as number | null,
    selectedCanteenId: null as number | null,
    selectedFloorId: null as number | null,
    loading: false,
    campusLoading: false,
    canteenLoading: false,
    floorLoading: false,
    error: null as string | null
  }),
  actions: {
    // 获取校区列表
    async fetchCampusList() {
      try {
        this.campusLoading = true;
        this.error = null;
        const res = await campusApi.getCampusList();
        if (res.code === 1) {
          this.campusList = res.data;
          if (this.campusList.length > 0 && !this.selectedCampusId) {
            this.selectedCampusId = this.campusList[0].id;
            this.fetchCanteenList(this.selectedCampusId);
          }
        } else {
          this.error = res.msg || '获取校区列表失败';
          ElMessage.error(this.error);
        }
      } catch (error) {
        this.error = '获取校区列表失败';
        ElMessage.error(this.error);
        console.error('获取校区列表失败:', error);
      } finally {
        this.campusLoading = false;
      }
    },
    // 获取食堂列表
    async fetchCanteenList(campusId: number) {
      try {
        this.canteenLoading = true;
        this.error = null;
        this.selectedCampusId = campusId;
        this.selectedCanteenId = null;
        this.selectedFloorId = null;
        const res = await canteenApi.getCanteenList(campusId);
        if (res.code === 1) {
          this.canteenList = res.data;
          if (this.canteenList.length > 0) {
            this.selectedCanteenId = this.canteenList[0].id;
            this.fetchFloorList(this.selectedCanteenId);
          } else {
            this.floorList = [];
            this.fetchDishList();
          }
        } else {
          this.error = res.msg || '获取食堂列表失败';
          ElMessage.error(this.error);
        }
      } catch (error) {
        this.error = '获取食堂列表失败';
        ElMessage.error(this.error);
        console.error('获取食堂列表失败:', error);
      } finally {
        this.canteenLoading = false;
      }
    },
    // 获取楼层列表
    async fetchFloorList(canteenId: number) {
      try {
        this.floorLoading = true;
        this.error = null;
        this.selectedCanteenId = canteenId;
        this.selectedFloorId = null;
        const res = await floorApi.getFloorList(canteenId);
        if (res.code === 1) {
          this.floorList = res.data;
          if (this.floorList.length > 0) {
            this.selectedFloorId = this.floorList[0].id;
          }
          this.fetchDishList();
        } else {
          this.error = res.msg || '获取楼层列表失败';
          ElMessage.error(this.error);
        }
      } catch (error) {
        this.error = '获取楼层列表失败';
        ElMessage.error(this.error);
        console.error('获取楼层列表失败:', error);
      } finally {
        this.floorLoading = false;
      }
    },
    // 获取菜品列表
    async fetchDishList(page = 1) {
      try {
        this.loading = true;
        this.error = null;
        this.currentPage = page;
        const params: any = {
          page: this.currentPage,
          pageSize: this.pageSize
        };
        
        if (this.selectedCampusId) {
          params.campusId = this.selectedCampusId;
        }
        
        if (this.selectedCanteenId) {
          params.canteenId = this.selectedCanteenId;
        }
        
        if (this.selectedFloorId) {
          params.floorId = this.selectedFloorId;
        }
        
        const res = await dishApi.getDishList(params);
        if (res.code === 1) {
          this.dishList = res.data.list;
          this.total = res.data.total;
        } else {
          this.error = res.msg || '获取菜品列表失败';
          ElMessage.error(this.error);
        }
      } catch (error) {
        this.error = '获取菜品列表失败';
        ElMessage.error(this.error);
        console.error('获取菜品列表失败:', error);
      } finally {
        this.loading = false;
      }
    },
    // 选择校区
    selectCampus(campusId: number) {
      if (this.selectedCampusId !== campusId) {
        this.fetchCanteenList(campusId);
      }
    },
    // 选择食堂
    selectCanteen(canteenId: number) {
      if (this.selectedCanteenId !== canteenId) {
        this.fetchFloorList(canteenId);
      }
    },
    // 选择楼层
    selectFloor(floorId: number) {
      if (this.selectedFloorId !== floorId) {
        this.selectedFloorId = floorId;
        this.fetchDishList();
      }
    },
    // 清空食堂列表
    clearCanteenList() {
      this.canteenList = [];
      this.selectedCanteenId = null;
    },
    // 清空楼层列表
    clearFloorList() {
      this.floorList = [];
      this.selectedFloorId = null;
    },
    // 切换页码
    changePage(page: number) {
      this.fetchDishList(page);
    }
  }
});