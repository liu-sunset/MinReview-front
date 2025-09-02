<template>
  <div class="dish-card" @click="goToDetail">
    <div class="dish-image">
      <img :src="dish.image" :alt="dish.name" />
    </div>
    <div class="dish-content">
      <div class="dish-name">{{ dish.name }}</div>
      <div class="dish-price">¥{{ dish.price }}</div>
      <div class="dish-description" v-if="dish.description">{{ dish.description }}</div>
      <div class="dish-location" v-if="dish.campusName || dish.canteenName || dish.floorName">
        <span v-if="dish.campusName">{{ dish.campusName }}</span>
        <span v-if="dish.canteenName"> > {{ dish.canteenName }}</span>
        <span v-if="dish.floorName"> > {{ dish.floorName }}</span>
      </div>
      <div class="dish-actions" @click.stop>
        <div class="action-item">
          <el-button 
            :icon="Check" 
            :class="{ 'active': isLiked }" 
            circle 
            @click="handleLike"
          />
          <span>{{ dish.likeCount }}</span>
        </div>
        <div class="action-item">
          <el-button 
            :icon="Close" 
            :class="{ 'active': isDisliked }" 
            circle 
            @click="handleDislike"
          />
          <span>{{ dish.dislikeCount }}</span>
        </div>
        <div class="action-item">
          <el-button 
            icon="ChatRound" 
            circle 
            @click="goToDetail"
          />
          <span>{{ dish.commentCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Check, Close, ChatRound } from '@element-plus/icons-vue';
import { useUserStore } from '../store/user';
import { likeApi } from '../api/services';

interface DishProps {
  id: number;
  name: string;
  image: string;
  price: number;
  description?: string;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  campusName?: string;
  canteenName?: string;
  floorName?: string;
}

const props = defineProps<{
  dish: DishProps;
}>();

const router = useRouter();
const userStore = useUserStore();

const isLiked = ref(props.dish.isLiked || false);
const isDisliked = ref(props.dish.isDisliked || false);
const lastRatingTime = ref<Date | null>(null);

// 获取用户对当前菜品的评价状态
const fetchUserRating = async () => {
  if (!userStore.isLoggedIn) return;
  
  try {
    const res = await likeApi.getUserDishRating(props.dish.id, userStore.userId);
    if (res.code === 1 && res.data) {
      isLiked.value = res.data.isLiked || false;
      isDisliked.value = res.data.isDisliked || false;
      lastRatingTime.value = res.data.lastRatingTime ? new Date(res.data.lastRatingTime) : null;
    }
  } catch (error) {
    console.error('获取用户评价状态失败:', error);
  }
};

// 检查是否在24小时内已评价
const isRatedWithin24Hours = computed(() => {
  if (!lastRatingTime.value) return false;
  
  const now = new Date();
  const hoursDiff = (now.getTime() - lastRatingTime.value.getTime()) / (1000 * 60 * 60);
  return hoursDiff < 24;
});

onMounted(() => {
  fetchUserRating();
});

const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  
  // 检查是否在24小时内已评价过且当前不是取消操作
  if (isRatedWithin24Hours.value && !isLiked.value) {
    ElMessage.warning('24小时内只能对同一菜品评价一次');
    return;
  }

  try {
    if (isLiked.value) {
      // 取消点赞
      await likeApi.cancelLike(props.dish.id, userStore.userId);
      isLiked.value = false;
      props.dish.likeCount--;
      lastRatingTime.value = null;
    } else {
      // 点赞
      await likeApi.likeDish({ dishId: props.dish.id, userId: userStore.userId });
      isLiked.value = true;
      props.dish.likeCount++;
      lastRatingTime.value = new Date();
      
      // 如果之前点踩了，取消点踩
      if (isDisliked.value) {
        isDisliked.value = false;
        props.dish.dislikeCount--;
      }
    }
  } catch (error) {
    ElMessage.error('操作失败，请稍后再试');
  }
};

const handleDislike = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  
  // 检查是否在24小时内已评价过且当前不是取消操作
  if (isRatedWithin24Hours.value && !isDisliked.value) {
    ElMessage.warning('24小时内只能对同一菜品评价一次');
    return;
  }

  try {
    if (isDisliked.value) {
      // 取消点踩
      await likeApi.cancelDislike(props.dish.id, userStore.userId);
      isDisliked.value = false;
      props.dish.dislikeCount--;
      lastRatingTime.value = null;
    } else {
      // 点踩
      await likeApi.dislikeDish({ dishId: props.dish.id, userId: userStore.userId });
      isDisliked.value = true;
      props.dish.dislikeCount++;
      lastRatingTime.value = new Date();
      
      // 如果之前点赞了，取消点赞
      if (isLiked.value) {
        isLiked.value = false;
        props.dish.likeCount--;
      }
    }
  } catch (error) {
    ElMessage.error('操作失败，请稍后再试');
  }
};

const goToDetail = () => {
  router.push(`/dish/${props.dish.id}`);
};
</script>

<style scoped lang="scss">
.dish-card {
  width: 100%;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }

  .dish-image {
    width: 100%;
    height: 0;
    padding-bottom: 75%; // 4:3 比例
    position: relative;
    overflow: hidden;
    background-color: #f0f0f0;
    
    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    &:hover img {
      transform: scale(1.05);
    }
  }

  .dish-content {
    padding: 12px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .dish-name {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 8px;
  }

  .dish-price {
    font-size: 18px;
    font-weight: 600;
    color: #f56c6c;
    margin-bottom: 8px;
  }

  .dish-description {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
  }

  .dish-location {
    font-size: 12px;
    color: #999;
    margin-bottom: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dish-actions {
    display: flex;
    justify-content: space-around;
    margin-top: auto;
    
    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .el-button {
        margin-bottom: 5px;
        
        &.active {
          color: #409eff;
          background-color: #ecf5ff;
        }
      }
      
      span {
        font-size: 12px;
        color: #666;
      }
    }
  }
}
</style>