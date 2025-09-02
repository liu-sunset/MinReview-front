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
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  width: 100%;
  
  .empty-icon {
    font-size: 48px;
    color: #909399;
    margin-bottom: 16px;
  }
  
  .empty-text {
    font-size: 16px;
    color: #909399;
  }
}
</style>