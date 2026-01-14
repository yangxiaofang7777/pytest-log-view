<script lang="ts" setup>
import type { Ace } from "ace-builds";
import { ElDialog } from "element-plus"
import { inject, ref, watch, type WritableComputedRef } from "vue";
import { VAceEditor } from 'vue3-ace-editor';
import ace from 'ace-builds';
import modeJsonUrl from 'ace-builds/src-noconflict/mode-json?url';
import themeChromeUrl from 'ace-builds/src-noconflict/theme-chrome?url';
import themeMonokaiUrl from 'ace-builds/src-noconflict/theme-monokai?url';
ace.config.setModuleUrl('ace/theme/monokai', themeMonokaiUrl);
ace.config.setModuleUrl('ace/theme/chrome', themeChromeUrl);
ace.config.setModuleUrl('ace/mode/json', modeJsonUrl);
const isDark = inject('isDark') as WritableComputedRef<boolean>
const isShow = ref(false)
const value = ref('')
const theme = ref(isDark.value ? 'monokai' : 'chrome')
let editorInstance: Ace.Editor | null = null
let initEditorResolve: (eidtor: Ace.Editor) => void = () => { }

const initEditor = () => {
  return new Promise<Ace.Editor>(rs => {
    if (editorInstance) return rs(editorInstance)
    initEditorResolve = rs
  })
}

const showDialog = async () => {
  isShow.value = true
  editorInstance = await initEditor()
}

const setData = async (data: any) => {
  let formatData = data
  try {
    formatData = JSON.stringify(JSON.parse(data), null, 2)
  } catch (e) { console.log(e) }
  value.value = formatData
}

const initHandle = (editor: Ace.Editor) => {
  initEditorResolve(editor)
}

watch(() => isDark.value, (value) => {
  theme.value = value ? 'monokai' : 'chrome'
})


defineExpose({
  showDialog,
  setData
})

</script>

<template>
  <ElDialog v-model="isShow" class="json-dialog" title="格式化 JSON 展示" width="60%" :close-on-click-modal="false">
    <div style="height: 600px;">
      <VAceEditor class="v-ace-editor" v-model:value="value" :theme="theme" lang="json" readonly @init="initHandle" />
    </div>
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

    .v-ace-editor {
      height: 100%;
    }
  }
}
</style>