<script lang="ts" setup>
import type { AppType } from "@/types";
import { ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { onMounted } from 'vue'

const typeList: AppType[] = ["LOCAL_FILE", "RESTAPI", "POST_MESSAGE"]

const typeTextMap: Record<AppType, string> = {
  LOCAL_FILE: "本地文件",
  RESTAPI: "REST 接口",
  POST_MESSAGE: "POST_MESSAGE"
}

const router = useRouter()

const clickHandle = async (type: AppType) => {
  if (type === 'POST_MESSAGE') return
  if (type === 'LOCAL_FILE') {
    router.push({
      name: 'logView',
      query: {
        appType: type
      }
    })
  }

  if (type === 'RESTAPI') {
    const { value } = await ElMessageBox.prompt('请输入接口地址', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      // eslint-disable-next-line no-useless-escape
      inputPattern: /^(https?:\/\/(([a-zA-Z0-9]+-?)+\.)*[a-zA-Z\d]+)+(:\d+)?(\/.*)?(\?.*)?(#.*)?$/,
      inputErrorMessage: '请输入正确的 URL',
    })
    router.push({
      name: 'logView',
      query: {
        appType: type,
        url: encodeURIComponent(value)
      }
    })
  }
}
const getUrlParams = () => {
  let params:any;
  // 获取地址栏的参数部分
  const urlSearch = window.location.search;
  if (urlSearch) {
    // 解析参数
    new URLSearchParams(urlSearch).forEach((value, key) => {
      params[key] = value;
    });
  }
  return params;
};

onMounted(()=>{
  // const params = getUrlParams();
  router.push({
      name: 'logView',
      query: {
        appType: 'RESTAPI',
        // taskId: `params.taskId`
        taskId: 'directory'
      }
    })
})

</script>

<template>
  <div class="app-type-select">
    <div class="app-type-select-header">选择日志数据获取方式</div>
    <div class="app-type-select-content">
      <template v-for="(item, index) in typeList" :key="item">
        <div class="type-item" v-if="item != 'POST_MESSAGE'" :tabindex="index + 1" @click="() => clickHandle(item)">{{
          typeTextMap[item]
        }}
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-type-select {
  height: 100%;
  width: 100%;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .app-type-select-header {
    max-width: 800px;
    min-width: 400px;
    width: 50%;
    margin-bottom: 80px;
    font-size: 18px;
  }

  .app-type-select-content {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    justify-content: space-between;
    max-width: 800px;
    min-width: 400px;
    width: 50%;

    .type-item {
      font-size: 16px;
      height: 150px;
      width: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--el-color-primary-dark-2);
      color: var(--el-color-white);
      font-weight: bolder;
      cursor: pointer;

      &:hover,
      &:focus {
        background-color: var(--el-color-primary);
      }
    }
  }
}
</style>