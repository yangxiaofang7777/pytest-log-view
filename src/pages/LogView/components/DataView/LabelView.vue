<script lang="ts" setup>
import StringView from './StringView.vue';

defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number, Boolean],
    required: true
  },
  labelWidth: {
    type: String,
    default: 'auto'
  },
  isShowDebugLog: {
    type: Boolean,
    default: false
  }
})

</script>

<template>
  <div class="label-view" v-if="isShowDebugLog || label !== 'Parameter'">
    <div class="label" :style="{ width: labelWidth }">{{ label }}</div>
    <div class="value" :style="{ width: `calc(100% - ${labelWidth})` }">
      <StringView :data="value"/>
      <!-- <StringArrView v-else /> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.label-view {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  width: 100%;
  font-size: 12px;
  // border-bottom: 1px solid var(--el-border-color);
  
  .label {
    // border-right: 1px solid var(--el-border-color);
    font-weight: bold;
    padding: 4px;
    min-width: 130px;
  }
  
  .value {
    word-break: break-all;
    padding: 4px;
  }
}
</style>
