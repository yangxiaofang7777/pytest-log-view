<script lang="ts" setup>
import { inject, onMounted, provide, ref, type Ref } from 'vue';
import type { BaseFileProvider } from './ObjectView.vue';
import path from 'path-browserify'
import { useRoute } from "vue-router";
import type { AppForm, AppType } from "@/types";
import { ElMessage } from 'element-plus'
import axios from "axios"

const props = defineProps({
  data: {
    type: String,
    required: true
  }
})
const appForm = ref({
  appType: 'LOCAL_FILE',
  url: '',
  file: '',
  title: ''
} as AppForm)
provide('appForm', [appForm, (data: AppForm) => appForm.value = data])

const [baseFilePath] = inject('baseFilePath') as BaseFileProvider

const linkPath = ref('')
const linkDes = ref('')
const linkName = ref('')
const isError = ref(false)
const route = useRoute()
const query = route.query
appForm.value.appType = query.appType as AppType
appForm.value.url = decodeURIComponent((query.url as string) || '')

const area = inject('area') as Ref<string>
const showLink = ref(true)
onMounted(() => {
  try {
    showLink.value = true
    const linkArr = JSON.parse(props.data.replace('_LINK:', '')) as string[]
    linkDes.value = linkArr[0]
    linkName.value = linkArr[1]
    console.log(linkDes.value, linkName.value)
    const baseDir = path.dirname(baseFilePath.value)
    
    if (appForm.value.appType === 'RESTAPI') {
      // const url = new URL(appForm.value.url)
      // const searchParam = url.searchParams
      // const taskId = searchParam.get('taskId') || ''
      // // 兼容module中有特殊字符的问题
      // const transferUrl = decodeURIComponent(appForm.value.url)
      // const match = transferUrl.match(/module=([^&].*?)(?=&taskId=)/)
      // const model = (match && match[1]) || ''
      // linkPath.value = 'http://' + path.join('10.154.243.47:8080/atcc/files/tasks_new', taskId, 'logs', model.replace('(','').replace(')', '/'), linkArr[1])

      // 下载文件
      if(linkName.value){
        showLink.value = true;
      }else{
        showLink.value = false;
      }
    } else {
      linkPath.value = path.join(baseDir, linkArr[1])
    }
    // if(linkPath.value.endsWith('.zip') && area.value === 'green' && !linkPath.value.includes('core')) {
    //   showLink.value = false
    // }
  } catch {
    isError.value = true
  }
})

const downloadLog = async(filename:string)=>{
  try{
    const res = await axios.post('/api/v1/logs/content', { filename })
    const blob = new Blob([res.data.data.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = linkName.value   // 用原文件名
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }catch{
    ElMessage.error('文件下载失败')
  }
}
</script>

<template>
  <div class="link-wrapper">
    <div v-if="!isError">
      <a v-if="showLink" href="javascript:;" title="点击下载" @click="downloadLog(linkName)">{{ linkDes }}</a>
      <span v-else>{{ linkDes + '文件未生成' }}</span>
    </div>
    <span v-else :title="data">链接数据有误，无法格式化</span>
  </div>
</template>


<style lang="scss" scoped></style>
