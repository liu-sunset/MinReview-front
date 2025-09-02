import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router/dist/vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/dish/:id',
    name: 'DishDetail',
    component: () => import('../views/DishDetail.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.name !== 'Login' && to.name !== 'Register' && !token) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;