<script setup lang="ts">
// App.vue 作为应用入口
import { onMounted } from 'vue';

// 在组件挂载时添加主题加载动画
onMounted(() => {
  document.body.classList.add('theme-loaded');
});
</script>

<template>
  <router-view />
</template>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
  color: #333;
  transition: background-color 0.3s ease;
}

/* 添加一些全局过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 主题加载动画 */
.theme-loaded {
  animation: themeTransition 0.5s ease-out;
}

@keyframes themeTransition {
  0% { opacity: 0.8; }
  100% { opacity: 1; }
}

/* 导入新主题样式 */
@import './user/styles/theme.scss';
</style>
