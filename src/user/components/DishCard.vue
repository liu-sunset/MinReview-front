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

// 检查用户是否在24小时内对该菜品进行过评价
const isRatedWithin24Hours = computed(() => {
  if (!userStore.isLoggedIn) return false;
  
  const ratingKey = `dish_rating_${props.dish.id}_${userStore.userId}`;
  const lastRatingTime = localStorage.getItem(ratingKey);
  
  if (!lastRatingTime) return false;
  
  const lastTime = new Date(lastRatingTime).getTime();
  const currentTime = new Date().getTime();
  const hoursDiff = (currentTime - lastTime) / (1000 * 60 * 60);
  
  return hoursDiff < 24;
});

// 记录用户评价时间
const recordRatingTime = () => {
  if (!userStore.isLoggedIn) return;
  
  const ratingKey = `dish_rating_${props.dish.id}_${userStore.userId}`;
  localStorage.setItem(ratingKey, new Date().toISOString());
};

onMounted(() => {
  // 检查本地存储中的评价状态
  if (userStore.isLoggedIn) {
    const likeStatusKey = `dish_like_${props.dish.id}_${userStore.userId}`;
    const dislikeStatusKey = `dish_dislike_${props.dish.id}_${userStore.userId}`;
    
    const storedLikeStatus = localStorage.getItem(likeStatusKey);
    const storedDislikeStatus = localStorage.getItem(dislikeStatusKey);
    
    if (storedLikeStatus === 'true') isLiked.value = true;
    if (storedDislikeStatus === 'true') isDisliked.value = true;
  }
});

const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  
  // 检查是否在24小时内已评价过且当前不是取消操作
  if (isRatedWithin24Hours.value && !isLiked.value && isDisliked.value) {
    ElMessage.warning('24小时内只能对同一菜品评价一次');
    return;
  }

  try {
    if (isLiked.value) {
      // 取消点赞
      await likeApi.cancelLike(props.dish.id, userStore.userId);
      isLiked.value = false;
      props.dish.likeCount--;
      
      // 更新本地存储
      localStorage.removeItem(`dish_like_${props.dish.id}_${userStore.userId}`);
    } else {
      // 点赞
      await likeApi.likeDish({ dishId: props.dish.id, userId: userStore.userId });
      isLiked.value = true;
      props.dish.likeCount++;
      
      // 记录评价时间
      recordRatingTime();
      
      // 更新本地存储
      localStorage.setItem(`dish_like_${props.dish.id}_${userStore.userId}`, 'true');
      
      // 如果之前点踩了，取消点踩
      if (isDisliked.value) {
        await likeApi.cancelDislike(props.dish.id, userStore.userId);
        isDisliked.value = false;
        props.dish.dislikeCount--;
        
        // 更新本地存储
        localStorage.removeItem(`dish_dislike_${props.dish.id}_${userStore.userId}`);
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
  if (isRatedWithin24Hours.value && !isDisliked.value && isLiked.value) {
    ElMessage.warning('24小时内只能对同一菜品评价一次');
    return;
  }

  try {
    if (isDisliked.value) {
      // 取消点踩
      await likeApi.cancelDislike(props.dish.id, userStore.userId);
      isDisliked.value = false;
      props.dish.dislikeCount--;
      
      // 更新本地存储
      localStorage.removeItem(`dish_dislike_${props.dish.id}_${userStore.userId}`);
    } else {
      // 点踩
      await likeApi.dislikeDish({ dishId: props.dish.id, userId: userStore.userId });
      isDisliked.value = true;
      props.dish.dislikeCount++;
      
      // 记录评价时间
      recordRatingTime();
      
      // 更新本地存储
      localStorage.setItem(`dish_dislike_${props.dish.id}_${userStore.userId}`, 'true');
      
      // 如果之前点赞了，取消点赞
      if (isLiked.value) {
        await likeApi.cancelLike(props.dish.id, userStore.userId);
        isLiked.value = false;
        props.dish.likeCount--;
        
        // 更新本地存储
        localStorage.removeItem(`dish_like_${props.dish.id}_${userStore.userId}`);
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
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dish-card {
  width: 100%;
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  animation: fadeIn 0.5s ease-out;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .dish-image {
    width: 100%;
    height: 0;
    padding-bottom: 75%; // 4:3 比例
    position: relative;
    overflow: hidden;
    background-color: #f5f5f5;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    
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
    padding: 16px;
    display: flex;
    flex-direction: column;
    flex: 1;
    background-color: #ffffff;
    border-top: 1px solid #f0f0f0;
  }

  .dish-name {
    font-size: 16px;
    font-weight: 500;
    color: #333333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 10px;
  }

  .dish-price {
    font-size: 18px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 10px;
  }

  .dish-description {
    font-size: 14px;
    color: #666666;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
  }

  .dish-location {
    font-size: 12px;
    color: #999999;
    margin-bottom: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 4px 0;
    border-bottom: 1px dashed #f0f0f0;
  }

  .dish-actions {
    display: flex;
    justify-content: space-around;
    margin-top: auto;
    padding-top: 10px;
    
    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .el-button {
        margin-bottom: 5px;
        border-radius: 12px;
        transition: all 0.3s ease;
        background-color: #f5f5f5;
        border: none;
        
        &.active {
          color: #333333;
          background-color: #e0e0e0;
          transform: scale(1.05);
        }
        
        &:hover {
          transform: translateY(-2px);
          background-color: #e0e0e0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
      
      span {
        font-size: 12px;
        color: #666666;
      }
    }
  }
}
</style>