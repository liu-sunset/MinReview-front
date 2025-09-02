import api from './index';

// 用户相关接口
export const userApi = {
  // 用户登录
  login: (data: { name: string; password: string }) => {
    return api.post('/user/login', data);
  },
  // 获取用户信息
  getUserInfo: (id: number) => {
    return api.get(`/user/personInfo?id=${id}`);
  },
  // 更新用户信息
  updateUserInfo: (data: any) => {
    return api.put('/user/personInfo', data);
  },
  // 注册账号
  register: (data: { name: string; password: string }) => {
    return api.post('/user/register', data);
  },
  // 注销账号
  deleteAccount: (id: number) => {
    return api.delete(`/user/personInfo?id=${id}`);
  },
  // 上传图片
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/file/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// 校区相关接口
export const campusApi = {
  // 获取校区列表
  getCampusList: () => {
    return api.get('/user/campus/list');
  }
};

// 食堂相关接口
export const canteenApi = {
  // 根据校区获取食堂列表
  getCanteenList: (campusId: number) => {
    return api.get(`/user/canteen/list/${campusId}`);
  }
};

// 楼层相关接口
export const floorApi = {
  // 根据食堂获取楼层列表
  getFloorList: (canteenId: number) => {
    return api.get(`/user/floor/list/${canteenId}`);
  }
};

// 菜品相关接口
export const dishApi = {
  // 获取菜品列表
  getDishList: (params: {
    page?: number;
    size?: number;
    keyword?: string;
    canteenId?: number;
    campusId?: number;
    categoryId?: number;
    floorId?: number;
  }) => {
    return api.get('/user/dish/list', { params });
  },
  // 获取菜品详情
  getDishDetail: (dishId: number) => {
    return api.get(`/user/dish/detail/${dishId}`);
  }
};

// 点赞/点踩相关接口
export const likeApi = {
  // 点赞菜品
  likeDish: (data: { dishId: number; userId: number }) => {
    return api.post('/user/like', data);
  },
  // 取消点赞
  cancelLike: (dishId: number, userId: number) => {
    return api.delete(`/user/like/${dishId}/${userId}`);
  },
  // 点踩菜品
  dislikeDish: (data: { dishId: number; userId: number }) => {
    return api.post('/user/dislike', data);
  },
  // 取消点踩
  cancelDislike: (dishId: number, userId: number) => {
    return api.delete(`/user/dislike/${dishId}/${userId}`);
  },

};

// 评论相关接口
export const commentApi = {
  // 获取菜品评论列表
  getComments: (params: { page?: number; pageSize?: number; dishId: number }) => {
    return api.get('/user/comment/list', { params });
  },
  // 添加评论
  addComment: (data: { dishId: number; userId: number; content: string; avatarUrl: string; userName: string }) => {
    return api.post('/user/comment', data);
  },
  // 删除评论
  deleteComment: (commentId: number) => {
    return api.delete(`/user/comment/${commentId}`);
  }
};