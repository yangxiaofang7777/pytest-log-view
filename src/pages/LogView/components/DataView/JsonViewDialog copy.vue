<script lang="ts" setup>
import { ElDialog } from "element-plus"
import { inject, nextTick, onBeforeUnmount, ref, watch, type WritableComputedRef } from "vue";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { useResizeObserver } from '@vueuse/core';


const isDark = inject('isDark') as WritableComputedRef<boolean>
const isShow = ref(false)
const jsonEditorRef = ref({} as HTMLElement)
let monacoEditor: monaco.editor.IStandaloneCodeEditor | null = null
let observerStopHandle: null | (() => void) = null

const initJsonEditor = () => {
  if (monacoEditor) return
  monacoEditor = monaco.editor.create(jsonEditorRef.value, {
    language: 'json',
    theme: isDark.value ? 'vs-dark' : 'vs'
  })
  const observer = useResizeObserver(jsonEditorRef.value, () => {
    monacoEditor?.layout()
  })
  observerStopHandle = observer.stop
}
const showDialog = async () => {
  isShow.value = true
  await nextTick()
}

const setData = (data: any) => {
  initJsonEditor()
  if (!monacoEditor) return
  monacoEditor.setValue(data)
  const formatAction = monacoEditor.getAction('editor.action.formatDocument')
  formatAction?.run()
  setTimeout(() => {
    formatAction?.run()
  }, 1000)
}

watch(() => isDark.value, (value) => {
  if (value) {
    if (monacoEditor) monacoEditor.updateOptions({
      theme: 'vs-dark'
    })
  } else {
    if (monacoEditor) monacoEditor.updateOptions({
      theme: 'vs'
    })
  }
})


onBeforeUnmount(() => {
  if (observerStopHandle) observerStopHandle()
})


defineExpose({
  showDialog,
  setData
})

</script>

<template>
  <ElDialog v-model="isShow" class="json-dialog" title="格式化 JSON 展示" width="80%" :close-on-click-modal="false">
    <div ref="jsonEditorRef" class="json-editor"></div>
  </ElDialog>
</template>

<style lang="scss" scoped>
.json-editor {
  height: 600px;
  width: 100%;
}
</style>

<style lang="scss">
.json-dialog {
  margin-top: 5vh !important;

  .el-dialog__header {
    padding: 12px 20px;

    .el-dialog__headerbtn {
      height: 20px;
      width: 20px;
      top: 16px;
      line-height: 20px;
    }
  }

  .el-dialog__body {
    padding: 0;
  }
}
</style>