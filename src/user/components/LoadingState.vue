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
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  width: 100%;
  background-color: #f9f9f9;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 20px 0;
  animation: fadeIn 0.5s ease-out;
  
  .loading-icon {
    font-size: 32px;
    color: #333333;
    margin-bottom: 16px;
    animation: rotate 1.5s linear infinite;
    padding: 16px;
    background-color: #f0f0f0;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .loading-text {
    font-size: 16px;
    color: #666666;
    font-weight: 500;
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

@media (max-width: 768px) {
  .loading-state {
    padding: 30px 0;
    
    .loading-icon {
      font-size: 28px;
      padding: 12px;
    }
    
    .loading-text {
      font-size: 14px;
    }
  }
}
</style>