<template>
  <div class="dish-detail-container">
    <div class="back-button">
      <el-button @click="goBack" icon="ArrowLeft">返回</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <loading-state message="加载菜品信息中..." />
    </div>
    
    <div v-else-if="!dish" class="error-container">
      <empty-state message="菜品信息不存在或已被删除" />
    </div>
    
    <template v-else>
      <div class="dish-info-section">
        <div class="dish-image">
          <img :src="dish.image" :alt="dish.name" />
        </div>
        
        <div class="dish-info">
          <h1 class="dish-name">{{ dish.name }}</h1>
          <div class="dish-meta">
            <div class="meta-item">
              <el-icon><Location /></el-icon>
              <span>{{ locationInfo }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Money /></el-icon>
              <span>¥{{ dish.price }}</span>
            </div>
          </div>
          
          <div class="dish-description">
            <p>{{ dish.description || '暂无描述' }}</p>
          </div>
          
          <div class="dish-actions">
            <div class="action-item">
              <el-button 
                :icon="isLiked ? 'Thumb' : 'Thumb'" 
                :class="{ 'active': isLiked }" 
                @click="handleLike"
              >
                {{ isLiked ? '已点赞' : '点赞' }} ({{ dish.likeCount }})
              </el-button>
            </div>
            <div class="action-item">
              <el-button 
                :icon="isDisliked ? 'Thumb' : 'Thumb'" 
                :class="{ 'active': isDisliked }" 
                @click="handleDislike"
              >
                {{ isDisliked ? '已点踩' : '点踩' }} ({{ dish.dislikeCount }})
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="comments-section">
        <h2 class="section-title">评论 ({{ comments.length }})</h2>
        
        <div class="comment-form" v-if="userStore.isLoggedIn">
          <el-form :model="commentForm" ref="commentFormRef" :rules="commentRules">
            <el-form-item label="评分" prop="rating">
              <el-rate
                v-model="commentForm.rating"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                :texts="['很差', '较差', '一般', '不错', '很好']"
                show-text
              />
            </el-form-item>
            <el-form-item prop="content">
              <el-input
                v-model="commentForm.content"
                type="textarea"
                :rows="3"
                placeholder="写下你的评论..."
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitComment" :loading="submitting">发表评论</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="login-prompt" v-else>
          <p>登录后才能发表评论</p>
          <el-button type="primary" @click="goToLogin">去登录</el-button>
        </div>
        
        <div class="comments-list">
          <div v-if="commentsLoading" class="loading-container">
            <loading-state message="加载评论中..." />
          </div>
          
          <div v-else-if="comments.length === 0" class="empty-container">
            <empty-state message="暂无评论，快来发表第一条评论吧" />
          </div>
          
          <div v-else class="comment-items">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <div class="user-info">
                  <el-avatar :size="40" :src="comment.avatarUrl || userDefaultAvatar"></el-avatar>
                  <div class="user-details">
                    <span class="username">{{ comment.name }}</span>
                    <div class="rating-display" v-if="comment.rating">
                      <el-rate 
                        v-model="comment.rating" 
                        disabled 
                        :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                        :size="14"
                      />
                    </div>
                  </div>
                </div>
                <div class="comment-time">{{ formatDate(comment.updateTime) }}</div>
              </div>
              <div class="comment-content">
                {{ comment.content }}
              </div>
              <div class="comment-actions" v-if="userStore.isLoggedIn && userStore.userId === comment.userId">
                <el-button type="danger" size="small" text @click="deleteComment(comment.id)">删除</el-button>
              </div>
            </div>
          </div>
          
          <div class="pagination-container" v-if="total > 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[5, 10, 20, 30]"
              layout="total, sizes, prev, pager, next"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, Location, Money, Thumb, Star } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import { useUserStore } from '../store/user';
import { dishApi, commentApi, likeApi } from '../api/services';
import LoadingState from '../components/LoadingState.vue';
import EmptyState from '../components/EmptyState.vue';

interface Dish {
  id: number;
  name: string;
  image: string;
  price: number;
  description: string;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  campusName: string;
  canteenName: string;
  floorName: string;
  isLiked?: boolean;
  isDisliked?: boolean;
}

interface Comment {
  id: number;
  content: string;
  userId: number;
  name: string;
  dishId: number;
  updateTime: string;
  avatarUrl: string;
  rating?: number;
  status: number;
  likeCount: number;
}

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const dishId = computed(() => Number(route.params.id));
const dish = ref<Dish | null>(null);
const loading = ref(true);
const isLiked = ref(false);
const isDisliked = ref(false);
const lastRatingTime = ref<Date | null>(null);

// 检查是否在24小时内已评价
const isRatedWithin24Hours = computed(() => {
  if (!lastRatingTime.value) return false;
  
  const now = new Date();
  const hoursDiff = (now.getTime() - lastRatingTime.value.getTime()) / (1000 * 60 * 60);
  return hoursDiff < 24;
});

// 评论相关
const comments = ref<Comment[]>([]);
const commentsLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const submitting = ref(false);
const userDefaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

const commentFormRef = ref<FormInstance>();
const commentForm = reactive({
  content: '',
  rating: 5 // 默认评分为5星
});

const commentRules = {
  content: [
    { required: true, message: '请输入评论内容', trigger: 'blur' },
    { min: 2, max: 200, message: '评论内容长度应在2到200个字符之间', trigger: 'blur' }
  ],
  rating: [
    { required: true, message: '请给菜品评分', trigger: 'change' }
  ]
};

const locationInfo = computed(() => {
  if (!dish.value) return '';
  return `${dish.value.campusName} > ${dish.value.canteenName} > ${dish.value.floorName}`;
});

onMounted(async () => {
  await fetchDishDetail();
  await fetchComments();
  await fetchUserRating();
});

// 获取用户对当前菜品的评价状态
const fetchUserRating = async () => {
  if (!userStore.isLoggedIn || !dishId.value) return;
  
  try {
    const res = await likeApi.getUserDishRating(dishId.value, userStore.userId);
    if (res.code === 1 && res.data) {
      isLiked.value = res.data.isLiked || false;
      isDisliked.value = res.data.isDisliked || false;
      lastRatingTime.value = res.data.lastRatingTime ? new Date(res.data.lastRatingTime) : null;
    }
  } catch (error) {
    console.error('获取用户评价状态失败:', error);
  }
};

const fetchDishDetail = async () => {
  loading.value = true;
  try {
    const res = await dishApi.getDishDetail(dishId.value);
    if (res.code === 1) {
      // 将API返回的imageUrl映射为image属性
      dish.value = {
        ...res.data,
        image: res.data.imageUrl // 添加image属性，值为imageUrl
      };
      isLiked.value = !!res.data.isLiked;
      isDisliked.value = !!res.data.isDisliked;
    } else {
      ElMessage.error(res.msg || '获取菜品详情失败');
    }
  } catch (error) {
    ElMessage.error('获取菜品详情失败');
  } finally {
    loading.value = false;
  }
};

const fetchComments = async () => {
  commentsLoading.value = true;
  try {
    const res = await commentApi.getComments({
        dishId: dishId.value,
        page: currentPage.value,
        pageSize: pageSize.value
      });
    
    if (res.code === 1) {
      comments.value = res.data.list || [];
      total.value = res.data.total || 0;
    } else {
      ElMessage.error(res.msg || '获取评论失败');
    }
  } catch (error) {
    console.error('获取评论失败:', error);
    ElMessage.error('获取评论失败');
  } finally {
    commentsLoading.value = false;
  }
};

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
      await likeApi.cancelLike(dishId.value, userStore.userId);
      isLiked.value = false;
      if (dish.value) dish.value.likeCount--;
      lastRatingTime.value = null;
    } else {
      // 点赞
      await likeApi.likeDish({ dishId: dishId.value, userId: userStore.userId });
      isLiked.value = true;
      if (dish.value) dish.value.likeCount++;
      lastRatingTime.value = new Date();
      
      // 如果之前点踩了，取消点踩
      if (isDisliked.value) {
        isDisliked.value = false;
        if (dish.value) dish.value.dislikeCount--;
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
      await likeApi.cancelDislike(dishId.value, userStore.userId);
      isDisliked.value = false;
      if (dish.value) dish.value.dislikeCount--;
      lastRatingTime.value = null;
    } else {
      // 点踩
      await likeApi.dislikeDish({ dishId: dishId.value, userId: userStore.userId });
      isDisliked.value = true;
      if (dish.value) dish.value.dislikeCount++;
      lastRatingTime.value = new Date();
      
      // 如果之前点赞了，取消点赞
      if (isLiked.value) {
        isLiked.value = false;
        if (dish.value) dish.value.likeCount--;
      }
    }
  } catch (error) {
    ElMessage.error('操作失败，请稍后再试');
  }
};

const submitComment = async () => {
  // 检查用户是否登录
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再发表评论');
    router.push('/login');
    return;
  }
  
  // 表单验证
  if (!commentFormRef.value) return;
  
  await commentFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请完善评论信息');
      return;
    }
    
    submitting.value = true;
    try {
      // 构建评论数据，确保与API文档一致
      const commentData = {
        dishId: dishId.value,
        userId: userStore.userId,
        content: commentForm.content.trim(),
        avatarUrl: userStore.avatarUrl,
        userName: userStore.userName
      };
      
      const res = await commentApi.addComment(commentData);
      
      if (res.code === 1) {
        ElMessage.success('评论发表成功');
        // 重置表单
        commentForm.content = '';
        commentForm.rating = 5;
        // 重新获取评论列表，回到第一页
        currentPage.value = 1;
        await fetchComments();
        // 更新菜品评论数
        if (dish.value) dish.value.commentCount++;
      } else {
        ElMessage.error(res.msg || '评论发表失败');
      }
    } catch (error) {
      console.error('评论发表失败:', error);
      ElMessage.error('评论发表失败');
    } finally {
      submitting.value = false;
    }
  });
};

// 删除评论
const deleteComment = async (commentId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const res = await commentApi.deleteComment(commentId);
    
    if (res.code === 1) {
      ElMessage.success('评论已删除');
      // 重新获取评论列表
      await fetchComments();
      // 更新菜品评论数
      if (dish.value && dish.value.commentCount > 0) dish.value.commentCount--;
    } else {
      ElMessage.error(res.msg || '删除评论失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error);
      ElMessage.error('删除评论失败');
    }
  }
};

const handleSizeChange = (pageSize: number) => {
  pageSize.value = pageSize;
  currentPage.value = 1;
  fetchComments();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchComments();
};

const goBack = () => {
  router.back();
};

const goToLogin = () => {
  router.push('/login');
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};
</script>

<style scoped lang="scss">
.dish-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  
  .back-button {
    margin-bottom: 20px;
  }
  
  .loading-container,
  .error-container {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .dish-info-section {
    display: flex;
    gap: 30px;
    margin-bottom: 40px;
    background-color: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    
    @media (max-width: 768px) {
      flex-direction: column;
    }
    
    .dish-image {
      width: 300px;
      height: 300px;
      border-radius: 12px;
      overflow: hidden;
      flex-shrink: 0;
      
      @media (max-width: 768px) {
        width: 100%;
        height: auto;
        aspect-ratio: 1/1;
      }
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .dish-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .dish-name {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 16px;
        color: #333;
      }
      
      .dish-meta {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        
        .meta-item {
          display: flex;
          align-items: center;
          color: #666;
          
          .el-icon {
            margin-right: 6px;
          }
        }
      }
      
      .dish-description {
        margin-bottom: 30px;
        color: #666;
        line-height: 1.6;
        flex: 1;
      }
      
      .dish-actions {
        display: flex;
        gap: 15px;
        
        .action-item {
          .el-button {
            &.active {
              color: #409eff;
              background-color: #ecf5ff;
            }
          }
        }
      }
    }
  }
  
  .comments-section {
    background-color: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    
    .section-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #333;
    }
    
    .comment-form {
      margin-bottom: 30px;
    }
    
    .login-prompt {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      margin-bottom: 30px;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
      
      p {
        color: #666;
      }
    }
    
    .comments-list {
      .comment-items {
        .comment-item {
          padding: 20px 0;
          border-bottom: 1px solid #eee;
          
          &:last-child {
            border-bottom: none;
          }
          
          .comment-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            
            .user-info {
              display: flex;
              align-items: center;
              gap: 12px;
              
              .user-details {
                display: flex;
                flex-direction: column;
                gap: 4px;
                
                .username {
                  font-weight: 500;
                  color: #333;
                  font-size: 16px;
                }
                
                .rating-display {
                  margin-top: 2px;
                }
              }
            }
            
            .comment-time {
              color: #999;
              font-size: 12px;
            }
          }
          
          .comment-content {
            color: #333;
            line-height: 1.6;
            word-break: break-word;
            padding: 5px 0 10px 0;
            font-size: 15px;
          }
          
          .comment-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;
          }
        }
      }
      
      .pagination-container {
        margin-top: 20px;
        display: flex;
        justify-content: center;
      }
    }
  }
}
</style>