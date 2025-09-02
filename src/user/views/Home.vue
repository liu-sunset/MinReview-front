<template>
  <div class="home-container">
    <header class="header">
      <div class="logo">MinReview</div>
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索菜品"
          prefix-icon="Search"
          clearable
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="user-actions">
        <template v-if="userStore.isLoggedIn">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="avatar-container" @click.stop="goToProfile">
              <el-avatar :size="40" :src="userStore.userInfo.avatarUrl || defaultAvatar" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <router-link to="/login" class="login-link">登录</router-link>
          <router-link to="/register" class="register-link">注册</router-link>
        </template>
      </div>
    </header>

    <main class="main-content">
      <div class="filters">
        <div class="filter-item">
          <el-select
            v-model="selectedCampus"
            placeholder="选择校区"
            @change="handleCampusChange"
            @focus="handleCampusFocus"
            clearable
            :loading="dishStore.campusLoading"
          >
            <el-option
              v-for="campus in dishStore.campusList"
              :key="campus.id"
              :label="campus.name"
              :value="campus.id"
            />
          </el-select>
        </div>
        <div class="filter-item">
          <el-select
            v-model="selectedCanteen"
            placeholder="选择食堂"
            @change="handleCanteenChange"
            @focus="handleCanteenFocus"
            clearable
            :disabled="!selectedCampus"
            :loading="dishStore.canteenLoading"
          >
            <el-option
              v-for="canteen in dishStore.canteenList"
              :key="canteen.id"
              :label="canteen.name"
              :value="canteen.id"
            />
          </el-select>
        </div>
        <div class="filter-item">
          <el-select
            v-model="selectedFloor"
            placeholder="选择楼层"
            @change="handleFloorChange"
            @focus="handleFloorFocus"
            clearable
            :disabled="!selectedCanteen"
            :loading="dishStore.floorLoading"
          >
            <el-option
              v-for="floor in dishStore.floorList"
              :key="floor.id"
              :label="floor.name"
              :value="floor.id"
            />
          </el-select>
        </div>
      </div>

      <div class="dish-list-container">
        <loading-state v-if="loading || dishStore.loading" :message="loading ? '加载菜品中...' : '正在处理数据...'" />
        <empty-state v-else-if="dishList.length === 0" message="暂无菜品数据" />
        <div v-else-if="dishStore.error" class="error-container">
          <el-alert :title="dishStore.error" type="error" show-icon />
        </div>
        <div v-else class="dish-list">
          <div v-for="dish in dishList" :key="dish.id" class="dish-item">
            <dish-card :dish="dish" />
          </div>
        </div>
      </div>

      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 40]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search, ArrowDown } from '@element-plus/icons-vue';
import { useDishStore } from '../store/dish';
import { useUserStore } from '../store/user';
import { dishApi } from '../api/services';
import DishCard from '../components/DishCard.vue';
import LoadingState from '../components/LoadingState.vue';
import EmptyState from '../components/EmptyState.vue';

interface Dish {
  id: number;
  name: string;
  image: string;
  price: number;
  description: string;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  isLiked?: boolean;
  isDisliked?: boolean;
}

const router = useRouter();
const dishStore = useDishStore();
const userStore = useUserStore();
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 筛选条件
const searchQuery = ref('');
const selectedCampus = ref<number | null>(null);
const selectedCanteen = ref<number | null>(null);
const selectedFloor = ref<number | null>(null);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 数据
const dishList = ref<Dish[]>([]);
const loading = ref(false);

// 初始化数据
onMounted(async () => {
  await Promise.all([
    dishStore.fetchCampusList(),
    fetchDishList()
  ]);
});

// 监听筛选条件变化
watch([selectedCampus, selectedCanteen, selectedFloor, currentPage, pageSize], () => {
  fetchDishList();
});

// 获取菜品列表
const fetchDishList = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      campusId: selectedCampus.value,
      canteenId: selectedCanteen.value,
      floorId: selectedFloor.value,
      keyword: searchQuery.value
    };
    
    const res = await dishApi.getDishList(params);
    if (res.code === 1) {
      // 将API返回的数据映射到组件需要的格式
      dishList.value = res.data.list.map((item: any) => ({
        id: item.id,
        name: item.name,
        image: item.imageUrl, // API返回的是imageUrl，组件使用的是image
        price: item.price,
        description: item.description,
        likeCount: item.likeCount,
        dislikeCount: item.dislikeCount,
        commentCount: item.commentCount,
        campusName: item.campusName,
        canteenName: item.canteenName,
        floorName: item.floorName
      }));
      total.value = res.data.total;
    } else {
      ElMessage.error(res.msg || '获取菜品列表失败');
    }
  } catch (error) {
    ElMessage.error('获取菜品列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理校区焦点事件 - 当用户点击校区下拉列表时触发
const handleCampusFocus = async () => {
  if (dishStore.campusList.length === 0) {
    await dishStore.fetchCampusList();
  }
};

// 处理校区变化
const handleCampusChange = async (campusId: number | null) => {
  selectedCanteen.value = null;
  selectedFloor.value = null;
  
  if (campusId) {
    await dishStore.fetchCanteenList(campusId);
  } else {
    dishStore.clearCanteenList();
    dishStore.clearFloorList();
  }
  
  currentPage.value = 1;
};

// 处理食堂焦点事件 - 当用户点击食堂下拉列表时触发
const handleCanteenFocus = async () => {
  if (selectedCampus.value && dishStore.canteenList.length === 0) {
    await dishStore.fetchCanteenList(selectedCampus.value);
  }
};

// 处理食堂变化
const handleCanteenChange = async (canteenId: number | null) => {
  selectedFloor.value = null;
  
  if (canteenId) {
    await dishStore.fetchFloorList(canteenId);
  } else {
    dishStore.clearFloorList();
  }
  
  currentPage.value = 1;
};

// 处理楼层焦点事件 - 当用户点击楼层下拉列表时触发
const handleFloorFocus = async () => {
  if (selectedCanteen.value && dishStore.floorList.length === 0) {
    await dishStore.fetchFloorList(selectedCanteen.value);
  }
};

// 处理楼层变化
const handleFloorChange = () => {
  currentPage.value = 1;
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchDishList();
};

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
};

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
};

// 跳转到个人中心页面
const goToProfile = () => {
  router.push('/profile');
};

// 处理用户下拉菜单命令
const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout();
    ElMessage.success('已退出登录');
    router.push('/login');
  } else if (command === 'profile') {
    goToProfile();
  }
};
</script>

<style scoped lang="scss">
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;

  .header {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 10;

    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-right: 30px;
    }

    .search-box {
      flex: 1;
      max-width: 500px;
      margin-right: 20px;
    }

    .user-actions {
      display: flex;
      align-items: center;
      gap: 15px;

      .avatar-container {
        cursor: pointer;
        border-radius: 50%;
        overflow: hidden;
        transition: transform 0.3s ease;
        
        &:hover {
          transform: scale(1.05);
        }
      }

      .login-link,
      .register-link {
        color: #333;
        text-decoration: none;
        font-size: 14px;
        padding: 5px 10px;
        border-radius: 4px;
        transition: background-color 0.3s;

        &:hover {
          background-color: #f0f0f0;
        }
      }

      .register-link {
        color: #409eff;
      }
    }
  }

  .main-content {
    flex: 1;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;

    .filters {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;

      .filter-item {
        width: 200px;
      }
    }

    .dish-list-container {
      margin-bottom: 20px;
    }

    .dish-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      
      @media (min-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      }
      
      @media (min-width: 992px) {
        grid-template-columns: repeat(5, 1fr);
      }

      .dish-item {
        height: 100%;
      }
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      margin-top: 30px;
    }
  }
}
</style>