<template>
  <div class="login-container">
    <div class="login-card">
      <h2>登录</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
        <el-form-item prop="name">
          <el-input v-model="loginForm.name" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" class="login-btn">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="register-link">
        <span>还没有账号？</span>
        <router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

const loginFormRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive({
  name: '',
  password: ''
});

const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ]
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        await userStore.login(loginForm.name, loginForm.password);
        ElMessage.success('登录成功');
        router.push('/');
      } catch (error: any) {
        console.error('登录错误:', error);
        ElMessage.error(error.response?.data?.msg || error.msg || '登录失败，请检查用户名和密码或网络连接是否正常');
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.5s ease-in-out;

  .login-card {
    width: 100%;
    max-width: 400px;
    padding: 40px;
    background-color: var(--el-bg-color, #fff);
    border-radius: 20px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(0);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
    }

    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: var(--el-text-color-primary, #303133);
      font-size: 28px;
      font-weight: 600;
      position: relative;
      
      &:after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 50px;
        height: 3px;
        background-color: var(--el-color-primary, #409eff);
        border-radius: 3px;
      }
    }
    
    .el-form-item {
      margin-bottom: 25px;
      
      .el-input__wrapper {
        border-radius: 12px;
        padding: 0 15px;
        box-shadow: 0 0 0 1px var(--el-border-color, #dcdfe6);
        transition: all 0.3s ease;
        
        &:hover, &.is-focus {
          box-shadow: 0 0 0 1px var(--el-color-primary, #409eff);
        }
        
        .el-input__inner {
          height: 45px;
        }
      }
    }

    .login-btn {
      width: 100%;
      padding: 12px 0;
      font-size: 16px;
      border-radius: 12px;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      }
    }

    .register-link {
      margin-top: 25px;
      text-align: center;
      font-size: 14px;
      color: var(--el-text-color-secondary, #606266);

      a {
        color: var(--el-color-primary, #409eff);
        text-decoration: none;
        margin-left: 5px;
        font-weight: 500;
        transition: all 0.3s ease;

        &:hover {
          color: var(--el-color-primary-light-3, #79bbff);
          text-decoration: none;
        }
      }
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>