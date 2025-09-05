<template>
  <div class="empty-state">
    <el-icon class="empty-icon"><Dish /></el-icon>
    <p class="empty-text">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { Dish } from '@element-plus/icons-vue';

defineProps({
  message: {
    type: String,
    default: '暂无数据'
  }
});
</script>

<style scoped lang="scss">
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.empty-state {
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
  
  .empty-icon {
    font-size: 48px;
    color: #666666;
    margin-bottom: 16px;
    padding: 20px;
    background-color: #f0f0f0;
    border-radius: 50%;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }
  
  .empty-text {
    font-size: 16px;
    color: #666666;
    font-weight: 500;
  }
}
</style>