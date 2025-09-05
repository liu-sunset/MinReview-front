<template>
  <div class="ai-chat-container" :class="{ 'minimized': isMinimized }">
    <div class="ai-chat-header">
      <div class="ai-chat-title">AI 助手</div>
      <div class="ai-chat-actions">
        <el-button type="text" @click="toggleMinimize">
          <el-icon><component :is="isMinimized ? 'Expand' : 'Fold'" /></el-icon>
        </el-button>
        <el-button type="text" @click="closeChat">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>
    <div class="ai-chat-body" v-show="!isMinimized">
      <div class="ai-chat-messages" ref="messagesContainer">
        <div v-for="(message, index) in messages" :key="index" class="ai-chat-message" :class="message.type">
          <div class="ai-chat-message-content">
            <div v-if="message.type === 'ai' && message.content === ''" class="ai-typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div v-else-if="message.type === 'ai'" v-html="renderMarkdown(message.content)" class="markdown-content"></div>
            <div v-else>{{ message.content }}</div>
          </div>
        </div>
      </div>
      <div class="ai-chat-input">
        <el-input
          v-model="userInput"
          placeholder="请输入您的问题..."
          :disabled="isLoading"
          @keyup.enter="sendMessage"
        >
          <template #append>
            <el-button :disabled="isLoading || !userInput.trim()" @click="sendMessage">
              <el-icon v-if="isLoading"><Loading /></el-icon>
              <el-icon v-else><Position /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';
import { Close, Fold, Expand, Position, Loading } from '@element-plus/icons-vue';
import { useUserStore } from '../store/user';
import { aiApi } from '../api/services';
import { marked } from 'marked';

interface Message {
  type: 'user' | 'ai';
  content: string;
}

const emit = defineEmits(['close']);
const userStore = useUserStore();
const isMinimized = ref(false);
const isLoading = ref(false);
const userInput = ref('');
const messages = ref<Message[]>([]);
const messagesContainer = ref<HTMLElement | null>(null);
const memoryId = ref(Date.now().toString());

// 初始化聊天
onMounted(() => {
  // 如果用户已登录，显示欢迎消息
  if (userStore.isLoggedIn && messages.value.length === 0) {
    messages.value.push({
      type: 'ai',
      content: '你好！我是MinReview的AI助手，有什么可以帮助你？'
    });
  } else if (!userStore.isLoggedIn) {
    messages.value.push({
      type: 'ai',
      content: '请先登录后再使用AI助手'
    });
  }
});

// 关闭聊天窗口
const closeChat = () => {
  emit('close');
};

// 最小化/展开聊天窗口
const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value;
};

// 渲染Markdown
const renderMarkdown = (content: string) => {
  return marked(content);
};

import { ContentFilter } from '../utils/contentFilter';

// 发送消息
const sendMessage = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再使用AI助手');
    return;
  }
  
  const message = userInput.value.trim();
  if (!message || isLoading.value) return;
  
  // 检测用户输入是否包含违规词汇
  if (ContentFilter.containsProfanity(message)) {
    ElMessage.error('您的输入包含违规词汇，请修改后再发送');
    return;
  }
  
  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: message
  });
  
  // 清空输入框
  userInput.value = '';
  
  // 添加AI正在输入的消息
  const aiMessageIndex = messages.value.length;
  messages.value.push({
    type: 'ai',
    content: ''
  });
  
  // 滚动到底部
  await scrollToBottom();
  
  // 设置加载状态
  isLoading.value = true;
  
  try {
    // 创建请求
    const response = await fetch('/api/user/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify({
        memoryId: memoryId.value,
        message: message
      })
    });
    
    if (!response.ok) {
      throw new Error('网络请求失败');
    }
    
    // 获取响应流
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }
    
    // 创建解码器
    const decoder = new TextDecoder('utf-8');
    let aiResponse = '';
    
    // 读取流数据
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // 解码数据
      const text = decoder.decode(value, { stream: true });
      aiResponse += text;
      
      // 更新AI消息内容
      messages.value[aiMessageIndex].content = aiResponse;
      
      // 使用requestAnimationFrame优化渲染
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  } catch (error) {
    console.error('AI聊天请求失败:', error);
    // 更新AI消息为错误信息
    messages.value[aiMessageIndex].content = '抱歉，我遇到了一些问题，请稍后再试。';
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 监听消息变化，自动滚动到底部
watch(messages, async () => {
  await scrollToBottom();
});
</script>

<style scoped lang="scss">
.ai-chat-container {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 550px;
  height: 700px;
  border-radius: 20px;
  background-color: var(--el-bg-color, white);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  transition: all 0.3s ease;
  animation: slide-up 0.3s ease;
  
  &.minimized {
    height: 60px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.ai-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: var(--el-text-color-primary, #303133);
  color: var(--el-color-white, white);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.ai-chat-title {
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.5px;
}

.ai-chat-actions {
  display: flex;
  gap: 10px;
  
  .el-button {
    padding: 4px;
    color: var(--el-color-white, white);
    transition: all 0.3s ease;
    border-radius: 8px;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }
  }
}

.ai-chat-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--el-bg-color, white);
}

.ai-chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background-color: var(--el-bg-color-page, #f5f5f5);
}

.ai-chat-message {
  display: flex;
  margin-bottom: 15px;
  animation: message-fade-in 0.3s ease;
  
  &.user {
    justify-content: flex-end;
    
    .ai-chat-message-content {
      background-color: var(--el-color-primary, #409eff);
      color: var(--el-color-white, white);
      border-radius: 18px 18px 0 18px;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
    }
  }
  
  &.ai {
    justify-content: flex-start;
    
    .ai-chat-message-content {
      background-color: var(--el-bg-color, white);
      color: var(--el-text-color-primary, #303133);
      border-radius: 18px 18px 18px 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--el-border-color-light, #e4e7ed);
    }
  }
}

@keyframes message-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-chat-message-content {
  padding: 15px 20px;
  max-width: 85%;
  word-break: break-word;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }
}

.ai-chat-input {
  padding: 15px;
  border-top: 1px solid var(--el-border-color-light, #e4e7ed);
  background-color: var(--el-bg-color, white);
  
  .el-input__wrapper {
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:hover, &.is-focus {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
  
  .el-input-group__append {
    .el-button {
      border-radius: 0 20px 20px 0;
      transition: all 0.3s ease;
      
      &:hover {
        background-color: var(--el-color-primary, #409eff);
        color: var(--el-color-white, white);
      }
    }
  }
}

.ai-typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px;
  
  span {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: var(--el-color-primary, #409eff);
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out both;
    
    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes typing {
  0%, 80%, 100% { 
    transform: scale(0.6);
  }
  40% { 
    transform: scale(1);
  }
}

/* Markdown样式 */
.markdown-content {
  line-height: 1.6;
  
  :deep(p) {
    margin-bottom: 12px;
  }
  
  :deep(strong) {
    font-weight: 600;
  }
  
  :deep(em) {
    font-style: italic;
  }
  
  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin-top: 20px;
    margin-bottom: 10px;
    font-weight: 600;
    color: var(--el-text-color-primary, #303133);
  }
  
  :deep(ul), :deep(ol) {
    padding-left: 20px;
    margin-bottom: 15px;
  }
  
  :deep(li) {
    margin-bottom: 8px;
  }
  
  :deep(code) {
    background-color: var(--el-fill-color-light, #f5f7fa);
    padding: 3px 6px;
    border-radius: 6px;
    font-family: monospace;
    color: var(--el-text-color-primary, #303133);
  }
  
  :deep(pre) {
    background-color: var(--el-fill-color, #f5f7fa);
    padding: 15px;
    border-radius: 12px;
    overflow-x: auto;
    margin-bottom: 15px;
    border: 1px solid var(--el-border-color-light, #e4e7ed);
    
    code {
      background-color: transparent;
      padding: 0;
    }
  }
  
  :deep(blockquote) {
    border-left: 4px solid var(--el-border-color, #dcdfe6);
    padding: 10px 15px;
    margin: 15px 0;
    background-color: var(--el-fill-color-lighter, #fafafa);
    border-radius: 0 8px 8px 0;
    color: var(--el-text-color-secondary, #606266);
  }
  
  :deep(a) {
    color: var(--el-color-primary, #409eff);
    text-decoration: none;
    transition: all 0.3s ease;
    
    &:hover {
      color: var(--el-color-primary-light-3, #79bbff);
      text-decoration: none;
    }
  }
  
  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    
    th, td {
      padding: 10px 15px;
      border: 1px solid var(--el-border-color-lighter, #ebeef5);
    }
    
    th {
      background-color: var(--el-fill-color, #f5f7fa);
      font-weight: 600;
      text-align: left;
    }
    
    tr:nth-child(even) {
      background-color: var(--el-fill-color-lighter, #fafafa);
    }
  }
}

@media (max-width: 768px) {
  .ai-chat-container {
    width: 90%;
    right: 5%;
    left: 5%;
    bottom: 70px;
    height: 600px;
  }
  
  .ai-chat-button {
    right: 10px;
    bottom: 10px;
  }
  
  .ai-chat-message-content {
    max-width: 90%;
  }
}
</style>