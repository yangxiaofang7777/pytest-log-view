<script lang="ts" setup>
import type { LogData, ProviderAppForm, ProviderLogData, Script } from "@/types";
import { inject, nextTick, onMounted, ref } from "vue";
import { ElButton, ElMessage, ElDialog } from "element-plus";
import axios from "axios"
import dayjs from "dayjs"

const [appForm, setAppForm] = inject('appForm') as ProviderAppForm
const [, setLogData] = inject('logData') as ProviderLogData

function isFileSystemAccessAPISupported() {
  return 'showOpenFilePicker' in window &&
    'showDirectoryPicker' in window &&
    'FileSystemHandle' in window
}

const getFileGroup = (path: string) => {
  const last = path.lastIndexOf('_')
  const group = path.slice(last + 1).split('.').at(0)
  return group
}

const getFileOrderByPrefix = (path: string) => {
  if (path.startsWith('setup_')) {
    return 1
  } else if (path.startsWith('teardown_')) {
    return 3
  } else {
    return 2
  }
}

const sortScripts = (scripts: Script[]) => {
  // 要求1，文件中最后一个 _ 后面的数字代表分组，数字相同为一组，同组中文件 setup 排最前，teardown 排最后，其他文件按时间排序
  // 要求2，不同组文件，按 setup 时间排序
  const setupScripts = scripts.filter(item => item.path.startsWith('setup_')).sort((a, b) => dayjs(a.start_time).valueOf() - dayjs(b.start_time).valueOf())
  const sortedGroupBySetupMap = new Map()
  for (let i = 0; i < setupScripts.length; i++) {
    const path = setupScripts[i].path
    const group = getFileGroup(path)
    if (group && !sortedGroupBySetupMap.has(group)) {
      sortedGroupBySetupMap.set(group, i)
    } else {
      console.warn(`${path} 未匹配到分组 ${group}`)
    }
  }
  const sortedScripts = scripts.sort((a, b) => {
    const aGroup = getFileGroup(a.path)
    const bGroup = getFileGroup(b.path)
    if (!aGroup || !bGroup) {
      return 0
    }
    if (aGroup !== bGroup) {
      const sortA = sortedGroupBySetupMap.get(aGroup)
      const sortB = sortedGroupBySetupMap.get(bGroup)
      if (sortA === undefined || sortB === undefined) return 0
      return sortA - sortB
    } else {
      const orderA = getFileOrderByPrefix(a.path)
      const orderB = getFileOrderByPrefix(b.path)
      return orderA - orderB
    }
  })

  return sortedScripts
}

const selectFileHandle = () => {
  const inputDom = document.createElement('input')
  inputDom.type = 'file'
  inputDom.multiple = true
  inputDom.accept = '.pytestlog.json'
  const scripts = [] as Script[]
  inputDom.addEventListener('change', async () => {
    if (!inputDom.files || inputDom.files.length === 0) return
    for (let i = 0; i < inputDom.files.length; i++) {
      const file = inputDom.files[i];
      const readFileAsync = (theFile: File) => new Promise<string>(resolve => {
        const reader = new FileReader()
        reader.onload = evt => resolve(evt.target?.result as string)
        reader.readAsText(theFile)
      })
      const fileStrCon = await readFileAsync(file)
      try {
        const fileObjRes = JSON.parse(fileStrCon) as Script
        fileObjRes.path = file.name
        let baseUrl = location.href.split('#')[0]
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, baseUrl.length - 1)
        if (baseUrl.endsWith('.html')) {
          let baseUrlList = baseUrl.split('/')
          baseUrlList = baseUrlList.slice(0, baseUrlList.length - 1)
          baseUrl = baseUrlList.join('/')
        }
        fileObjRes._baseFilePath = baseUrl + '/' + file.name
        scripts.push(fileObjRes)
      } catch (e) {
        ElMessage.error(`选取文件 ${file.name} 无法格式化为 JSON 数据`)
      }
    }
    if (scripts.length === 0) return
    if (scripts.length === 1) {
      setLogData(null as unknown as LogData)
      setAppForm({
        ...appForm.value,
        file: scripts[0].path,
        title: scripts[0].path
      })
      await nextTick()
      setLogData(scripts[0])
    } else {
      const sortedScripts = sortScripts(scripts)
      setLogData(null as unknown as LogData)
      setAppForm({
        ...appForm.value,
        file: 'directory',
        title: 'directory'
      })
      await nextTick()
      setLogData({
        dir: 'directory',
        scripts: [
          // ...setupScripts,
          ...sortedScripts,
          // ...teardownScripts
        ]
      })
    }
    isShowDialog.value = false
  })
  inputDom.click()
}

const readDirectory = async (dirHandle: FileSystemDirectoryHandle) => {
  const files: { name: string, content: string, path: string }[] = []

  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      if (!entry.name.endsWith('.pytestlog.json')) {
        continue
      }
      const file = await entry.getFile()
      files.push({
        name: entry.name,
        content: await file.text(),
        path: entry.name
      })
    } else if (entry.kind === 'directory') {
      const subFiles = await readDirectory(entry)
      files.push(...subFiles.map(f => ({
        ...f,
        path: `${entry.name}/${f.path}`
      })))
    }
  }

  return files
}

const transferFileToScript = (files: { name: string, content: string, path: string }[]) => {
  const scripts: Script[] = []
  let baseUrl = location.href.split('#')[0]
  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, baseUrl.length - 1)
  if (baseUrl.endsWith('.html')) {
    let baseUrlList = baseUrl.split('/')
    baseUrlList = baseUrlList.slice(0, baseUrlList.length - 1)
    baseUrl = baseUrlList.join('/')
  }
  for (const file of files) {
    try {
      const fileObjRes = JSON.parse(file.content) as Script
      fileObjRes.path = file.name
      fileObjRes._baseFilePath = baseUrl + '/' + file.name
      scripts.push(fileObjRes)
    } catch (e) {
      ElMessage.error(`选取文件 ${file.name} 无法格式化为 JSON 数据`)
    }
  }
  return scripts
}

const selectFolderHandle = async () => {
  try {
    const dirHandle = await window.showDirectoryPicker()
    const files = await readDirectory(dirHandle)
    // console.log('select folder: ', files)
    const scripts = transferFileToScript(files)
    if (scripts.length === 0) return
    if (scripts.length === 1) {
      setLogData(null as unknown as LogData)
      setAppForm({
        ...appForm.value,
        file: scripts[0].path,
        title: scripts[0].path
      })
      await nextTick()
      setLogData(scripts[0])
    } else {
      const sortedScripts = sortScripts(scripts)
      console.log(sortedScripts);
      setLogData(null as unknown as LogData)
      setAppForm({
        ...appForm.value,
        file: 'directory',
        title: 'directory'
      })
      await nextTick()
      setLogData({
        dir: 'directory',
        scripts: [
          // ...setupScripts,
          ...sortedScripts,
          // ...teardownScripts
        ]
      })
    }
    isShowDialog.value = false
  } catch (err) {
    console.error('Error accessing folder:', err);
  }
}

const loading = ref(false)
const loadData = async () => {
  try {
    loading.value = true
    // 注释源代码
    /* const transferUrl = decodeURIComponent(appForm.value.url)
    // 兼容module中有特殊字符的问题
    const match = transferUrl.match(/module=([^&].*?)(?=&taskId=)/)
    const decodeUrl = new URL(decodeURIComponent(decodeURIComponent(appForm.value.url)))
    const queryString = decodeUrl.search
    const urlSearch = new URLSearchParams(queryString)
    const module = (match && match[1]) || ''
    const script = urlSearch.get('script')
    const res = await axios.get(transferUrl.replace(module, encodeURIComponent(module))) */

    // 修改代码
    const transferUrl = decodeURIComponent(appForm.value.url)
    const taskId = new URLSearchParams(transferUrl.split('?')[1]).get('taskId')
    const res = await axios.get(transferUrl)
    let logData: LogData | null = null
    setAppForm({
      ...appForm.value,
      title: taskId || appForm.value.url
    })
    if (taskId) {
      logData = {
        dir: taskId,
        scripts: res.data.data || []
      }
    }
    // if (script) {
    //   logData = res.data
    // }
    if (!logData) return
    setLogData(null as unknown as LogData)
    await nextTick()
    console.log(logData)
    setLogData(logData)
  } catch (e: any) {
    ElMessage.error(e)
  } finally {
    loading.value = false
  }
}

const windowMessageHandle = (event: MessageEvent<any>) => {
  const data = event.data
  if (data.title) setAppForm({
    ...appForm.value,
    title: data.title
  })
  console.log(data.data)
  if (data.data) setLogData(data.data)
}

const isShowDialog = ref(false)

const showSelectFileDialog = () => {
  isShowDialog.value = true
}

onMounted(() => {
  if (appForm.value.appType === 'RESTAPI') loadData()
  if (appForm.value.appType === 'POST_MESSAGE') window.addEventListener('message', windowMessageHandle)
  if (appForm.value.appType === 'LOCAL_FILE') showSelectFileDialog()
})

</script>

<template>
  <div class="log-header">
    <div class="file-name" :title="appForm.title">{{ appForm.title }}</div>
    <div class="file-select" v-if="appForm.appType === 'LOCAL_FILE'">
      <ElButton type="primary" text size="small" @click="showSelectFileDialog">选择文件</ElButton>
    </div>
    <div class="reload" v-if="appForm.appType === 'RESTAPI'">
      <ElButton type="primary" size="small" :loading="loading" @click="loadData">刷新</ElButton>
    </div>
    <ElDialog title="点击下方按钮选择文件" v-model="isShowDialog" :close-on-click-modal="false" width="400">
      <ElButton type="primary" size="small" @click="selectFileHandle">选择文件</ElButton>
      <ElButton type="primary" size="small" :disabled="!isFileSystemAccessAPISupported()" @click="selectFolderHandle">选择目录</ElButton>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.log-header {
  height: 40px;
  background-color: var(--el-bg-color-overlay);
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  padding: 0 20px;
  box-shadow: var(--el-box-shadow);
  z-index: 2000;

  .file-name,
  .url {
    max-width: 450px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .file-select,
  .reload {
    margin-left: 20px;
  }
}
</style>
