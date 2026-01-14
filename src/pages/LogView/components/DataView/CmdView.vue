<script lang="ts" setup>
import { computed } from 'vue';
import { decode } from 'js-base64';

const props = defineProps({
  data: {
    type: String,
    required: true
  }
})

const compuData = computed(() => {
  let data = props.data.replace('_CMD:b', '')
  data = decode(data)
  data = data.replaceAll('<', '&lt;')
  data = data.replaceAll('>', '&gt;')
  return data
})

</script>

<template>
  <div class="cmd-wrapper">
    <div class="xterm-content" ref="xtermRef" v-html="compuData" />
  </div>
</template>


<style lang="scss" scoped>
.cmd-wrapper {
  width: 100%;
  min-width: 600px;
  max-height: 200px;
  padding: 4px;
  background-color: var(--el-color-black);
  overflow-y: auto;

  .xterm-content {
    font-family: Consolas, monospace, 'Courier New';
    white-space: pre-wrap;
    color: var(--el-color-white);
  }
}
</style>