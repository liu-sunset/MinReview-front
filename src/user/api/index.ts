import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    console.error('API请求错误:', error);
    // 处理网络错误
    if (!error.response) {
      return Promise.reject({ msg: '网络连接失败，请检查后端服务是否启动' });
    }
    // 处理HTTP状态码错误
    return Promise.reject(error.response.data || { msg: '请求失败' });
  }
);

export default api;