<template>
  <div class="profile-container">
    <div class="profile-header">
      <el-button @click="goBack" icon="ArrowLeft" plain>返回</el-button>
      <h2>个人中心</h2>
    </div>
    
    <div class="profile-content">
      <div class="profile-left">
        <div class="avatar-container">
          <el-avatar :size="120" :src="userInfo.avatarUrl || defaultAvatar" />
        </div>
      </div>
      
      <div class="profile-right">
        <div class="info-section">
          <h3>个人信息</h3>
          <div class="info-item">
            <span class="label">姓名：</span>
            <span class="value">{{ userInfo.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">性别：</span>
            <span class="value">{{ formatGender(userInfo.gender) }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话：</span>
            <span class="value">{{ userInfo.phone || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="label">注册时间：</span>
            <span class="value">{{ userInfo.createTime }}</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <el-button type="primary" @click="openEditDialog">编辑信息</el-button>
          <el-button type="danger" @click="confirmLogout">注销账号</el-button>
        </div>
      </div>
    </div>
    
    <!-- 编辑信息对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑个人信息"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="头像" prop="avatarUrl">
          <div class="avatar-upload">
            <el-avatar 
              :size="100" 
              :src="editForm.avatarUrl || defaultAvatar" 
              @click="triggerFileUpload"
              class="clickable-avatar"
            />
            <div class="upload-tip">点击头像上传新图片</div>
            <input 
              type="file" 
              ref="fileInput" 
              style="display: none" 
              accept="image/jpeg,image/png,image/gif" 
              @change="handleFileChange"
            />
          </div>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="editForm.gender" placeholder="请选择性别">
            <el-option :value="0" label="未知" />
            <el-option :value="1" label="男" />
            <el-option :value="2" label="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="submitting">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useUserStore } from '../store/user';
import { userApi } from '../api/services';

const router = useRouter();
const userStore = useUserStore();
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 用户信息
const userInfo = ref({
  id: 0,
  name: '',
  avatarUrl: '',
  gender: 0,
  phone: '',
  createTime: ''
});

// 编辑表单相关
const editDialogVisible = ref(false);
const editFormRef = ref<FormInstance>();
const submitting = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);

const editForm = reactive({
  id: 0,
  name: '',
  avatarUrl: '',
  gender: 0,
  phone: ''
});

const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度应为2-20个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ]
});

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const res = await userApi.getUserInfo(userStore.userId);
    if (res.code === 1) {
      userInfo.value = res.data;
    } else {
      ElMessage.error(res.msg || '获取用户信息失败');
    }
  } catch (error: any) {
    console.error('获取用户信息错误:', error);
    ElMessage.error(error.msg || '获取用户信息失败');
  }
};

// 格式化性别
const formatGender = (gender: number) => {
  switch (gender) {
    case 1: return '男';
    case 2: return '女';
    default: return '未知';
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 打开编辑对话框
const openEditDialog = async () => {
  try {
    // 获取最新的用户信息
    const res = await userApi.getUserInfo(userStore.userId);
    if (res.code === 1) {
      // 将获取到的用户信息填充到编辑表单中
      editForm.id = res.data.id;
      editForm.name = res.data.name;
      editForm.avatarUrl = res.data.avatarUrl || '';
      editForm.gender = res.data.gender;
      editForm.phone = res.data.phone || '';
      
      editDialogVisible.value = true;
    } else {
      ElMessage.error(res.msg || '获取用户信息失败');
    }
  } catch (error: any) {
    console.error('获取用户信息错误:', error);
    ElMessage.error(error.msg || '获取用户信息失败');
  }
};

// 触发文件上传
const triggerFileUpload = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

// 处理文件选择
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (files && files.length > 0) {
    const file = files[0];
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      ElMessage.error('请上传JPG、PNG或GIF格式的图片');
      return;
    }
    
    // 验证文件大小（限制为10MB）
    if (file.size > 10 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过10MB');
      return;
    }
    
    try {
      uploading.value = true;
      const loadingInstance = ElLoading.service({
        lock: true,
        text: '上传中...',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      
      // 上传图片
      const res = await userApi.uploadImage(file);
      if (res.code === 1) {
        // 更新表单中的头像URL
        editForm.avatarUrl = res.data;
        ElMessage.success('头像上传成功');
      } else {
        ElMessage.error(res.msg || '上传失败');
      }
    } catch (error: any) {
      console.error('上传图片错误:', error);
      ElMessage.error(error.msg || '上传失败');
    } finally {
      uploading.value = false;
      ElLoading.service().close();
      // 清空文件输入框，以便再次选择同一文件
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    }
  }
};

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return;
  
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true;
        const res = await userApi.updateUserInfo(editForm);
        if (res.code === 1) {
          ElMessage.success('更新成功');
          editDialogVisible.value = false;
          
          // 更新本地存储的用户信息
          const updatedUserInfo = {
            ...userStore.userInfo,
            name: editForm.name,
            avatarUrl: editForm.avatarUrl,
            gender: editForm.gender,
            phone: editForm.phone
          };
          localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
          userStore.$patch({ userInfo: updatedUserInfo });
          
          // 重新获取用户信息
          await fetchUserInfo();
        } else {
          ElMessage.error(res.msg || '更新失败');
        }
      } catch (error: any) {
        console.error('更新用户信息错误:', error);
        ElMessage.error(error.msg || '更新失败');
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 确认注销账号
const confirmLogout = () => {
  ElMessageBox.confirm(
    '确定要注销账号吗？此操作不可逆!',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await userApi.deleteAccount(userStore.userId);
      if (res.code === 1) {
        ElMessage.success('账号已注销');
        userStore.logout();
        router.push('/login');
      } else {
        ElMessage.error(res.msg || '注销失败');
      }
    } catch (error: any) {
      console.error('注销账号错误:', error);
      ElMessage.error(error.msg || '注销失败');
    }
  }).catch(() => {
    // 用户取消操作
  });
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped lang="scss">
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .profile-header {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
    
    h2 {
      margin-left: 20px;
      color: #333;
    }
  }
  
  .profile-content {
    display: flex;
    gap: 40px;
    
    @media (max-width: 768px) {
      flex-direction: column;
    }
    
    .profile-left {
      flex: 0 0 200px;
      
      .avatar-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        background-color: #f5f5f5;
        border-radius: 12px;
      }
    }
    
    .profile-right {
      flex: 1;
      
      .info-section {
        background-color: #f5f5f5;
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 20px;
        
        h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #333;
          font-size: 18px;
        }
        
        .info-item {
          margin-bottom: 15px;
          display: flex;
          
          .label {
            width: 100px;
            color: #666;
            font-weight: 500;
          }
          
          .value {
            color: #333;
          }
        }
      }
      
      .action-buttons {
        display: flex;
        gap: 15px;
        
        @media (max-width: 768px) {
          flex-direction: column;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  
  .clickable-avatar {
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    
    &:hover {
      transform: scale(1.05);
      border-color: #409EFF;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
  }
  
  .upload-tip {
    font-size: 12px;
    color: #909399;
  }
}
</style>