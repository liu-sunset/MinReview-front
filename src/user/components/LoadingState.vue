<template>
  <div class="loading-state">
    <el-icon class="loading-icon"><Loading /></el-icon>
    <p class="loading-text">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue';

defineProps({
  message: {
    type: String,
    default: '加载中...'
  }
});
</script>

<style scoped lang="scss">
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  width: 100%;
  
  .loading-icon {
    font-size: 32px;
    color: #409eff;
    margin-bottom: 16px;
    animation: rotate 1.5s linear infinite;
  }
  
  .loading-text {
    font-size: 16px;
    color: #606266;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>