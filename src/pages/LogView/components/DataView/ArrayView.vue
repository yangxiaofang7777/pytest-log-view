<script lang="ts" setup>
import { computed } from "vue";
import ObjectView from "./ObjectView.vue";
import LabelView from "./LabelView.vue";

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  arrayKey: {
    type: String,
    required: true
  },
  parentId: {
    type: String,
    required: true
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

const stringValueList = computed(() => {
  return props.data.filter(item => Object.prototype.toString.call(item) === '[object String]') as string[]
})

const objectValueList = computed(() => {
  return props.data.filter(item => Object.prototype.toString.call(item) === '[object Object]') as object[]
})


</script>

<template>
  <div class="array-view">
    <!-- <template v-if="stringValueList.length > 0">
      <LabelView :label="arrayKey" :value="stringValueList.join('\r\n')" />
    </template> -->
    <template v-if="objectValueList.length > 0">
      <ObjectView :isShowUnimportant="isShowUnimportant" :isShowDebugLog="isShowDebugLog" v-for="(item, index) in objectValueList" :key="index" :data="item" :parent-id="parentId"
        :data-id="`${arrayKey} ${index + 1}`" :index="index + 1" />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
