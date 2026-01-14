<script lang="ts" setup>
import { computed, inject, ref, type Ref } from 'vue';
import { decode } from 'js-base64';
import { ElButton } from 'element-plus'
import { DocumentCopy, Tickets } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type JsonViewDialog from './JsonViewDialog.vue';

const props = defineProps({
  data: {
    type: String,
    required: true
  }
})

const jsonContentRef = ref({} as HTMLElement)

const compuData = computed(() => {
  let data: object | string = props.data.replace('_JSON:b', '')
  data = decode(data)
  try {
    data = JSON.parse(data)
  } catch (e) {
    console.error('JSON.parse error', e)
  }
  return data
})

const compuStringData = computed(() => {
  if (typeof compuData.value === 'string') return compuData.value
  return JSON.stringify(compuData.value)
})




const { copy, isSupported } = useClipboard({ legacy: true })
const selectAndCopy = async () => {
  if (isSupported.value) {
    await copy(compuStringData.value)
  }
  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNode(jsonContentRef.value)
  selection?.removeAllRanges()
  selection?.addRange(range)
}

const jsonViewDialogRef = inject('jsonViewDialogRef') as Ref<InstanceType<typeof JsonViewDialog>>
const dialogShow = async () => {
  await jsonViewDialogRef.value.showDialog()
  jsonViewDialogRef.value.setData(compuStringData.value)
}

</script>

<template>
  <div class="json-wrapper">
    <div class="json-header">
      <ElButton title="复制数据" :icon="DocumentCopy" size="small" @click="() => selectAndCopy()" />
      <ElButton title="格式化展示数据" :icon="Tickets" size="small" @click="() => dialogShow()" />
    </div>
    <div class="json-content" ref="jsonContentRef">
      {{ compuData }}
    </div>
  </div>
</template>


<style lang="scss" scoped>
.json-wrapper {
  background-color: var(--el-fill-color-light);
  position: relative;

  &:hover {
    .json-header {
      opacity: 1;
    }
  }

  .json-header {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    padding: 4px;
    opacity: 0;

    .el-button {
      padding: 4px;
    }
  }

  .json-content {
    padding: 0 10px 10px 10px;
  }
}
</style>