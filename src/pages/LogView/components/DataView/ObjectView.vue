<script lang="ts" setup>
import LabelView from "./LabelView.vue"
import ArrayView from "./ArrayView.vue"
import InfoPane from "./InfoPane.vue"
import { computed, inject, provide, ref, type PropType, type Ref } from "vue";
import { decode } from 'js-base64';

export interface BaseFileProvider extends Array<any> {
  0: Ref<string>,
  1: (val: string) => void
}
const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  parentId: {
    type: String,
    required: true
  },
  dataId: {
    type: String,
    required: true
  },
  borderType: {
    type: String as PropType<'solid' | 'dashed'>,
    default: 'dashed'
  },
  index: {
    type: Number
  },
  isShowUnimportant: {
    type: Boolean,
    default: false
  },
  isShowDebugLog:{
    type: Boolean,
    default: false
  }
})

let baseFileInject = inject<BaseFileProvider>('baseFilePath')
if (!baseFileInject) {
  const baseFilePath = ref('')
  const setBaseFilePath = (data: string) => baseFilePath.value = data
  baseFileInject = [baseFilePath, setBaseFilePath]
  provide<BaseFileProvider>('baseFilePath', baseFileInject)
  if (props.data._baseFilePath) setBaseFilePath(props.data._baseFilePath)
}

const compuTitleAndTag = computed(() => {
  const dataTitle = props.data['Title'] || []
  let tag = dataTitle[0] || props.dataId
  if (props.index) tag += ` ${props.index}`
  let title = dataTitle[1] || props.dataId
  title = title.replace('_HTML:b', '')
  title = decode(title)
  let layer = props.data["layer"] || title + (props.index ? `${props.index - 1}` : '0')


  return {
    tag,
    title,
    layer
  }
})

const isShowLabelView = (value: any, key: string) => {
  const notShowArr = ['id', 'start_time', 'end_time', 'elapsed_time', 'Result', 'Title', '_baseFilePath']
  const valueType = Object.prototype.toString.call(value)
  console.log(key, value );
  if (['[object Object]', '[object Array]'].includes(valueType)) return false
  return !notShowArr.includes(key)
}

const isShowTimeLabel = computed(() => {
  return !!props.data['start_time'] && !!props.data['end_time'] && !!props.data['elapsed_time']
})

const timeLabel = computed(() => {
  return `${props.data['start_time']} / ${props.data['end_time']} / ${props.data['elapsed_time']}`
})

</script>

<template>
  <div class="object-view" v-if="isShowUnimportant || data.log_filter_tag !== 'unimportant'">
    <InfoPane :parent-id="parentId" :tag="compuTitleAndTag.tag" :title-data="compuTitleAndTag.title" :layer-data="compuTitleAndTag.layer"
      :more-info="data['elapsed_time']" :data-id="dataId" :pane-state="data.Result" :border-type="borderType">
      <div class="label-view-wrapper">
        <LabelView :isShowDebugLog="isShowDebugLog" v-if="isShowTimeLabel" label="Start / End / Elapsed" :value="timeLabel" />
        <template v-for="(value, key) in data" :key="key">
          <LabelView v-if="isShowLabelView(value, key)" :isShowDebugLog="isShowDebugLog"  :label="key" :value="value" />
        </template>
      </div>
      <template v-for="(value, key) in data" :key="key">
        <ObjectView :isShowUnimportant="isShowUnimportant" :isShowDebugLog="isShowDebugLog" v-if="Object.prototype.toString.call(value) === '[object Object]'" :data="value" :parent-id="parentId"
          :data-id="key" />
        <ArrayView :isShowUnimportant="isShowUnimportant" :isShowDebugLog="isShowDebugLog" v-if="Object.prototype.toString.call(value) === '[object Array]'" :data="value" :array-key="key"
          :parent-id="`${parentId}_|_${dataId}`" />
      </template>
    </InfoPane>
  </div>
</template>

<style lang="scss" scoped>
.object-view {
  .label-view-wrapper {
    border-bottom: 0;
    margin-bottom: 4px;
    // border: 1px solid var(--el-border-color);
    border-bottom: 0px;
  }
}
</style>
