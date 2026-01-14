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
  let data = props.data.replace('_HTML:b', '')
  data = decode(data)
  // data = data.replaceAll(' ', '&nbsp;')
  // data = data.replaceAll('\n', '<br />')
  return data
})

</script>

<template>
  <!-- <div class="html-wrapper" v-html="compuData" /> -->
  <div class="html-wrapper">
    {{ compuData }}
  </div>
</template>


<style lang="scss" scoped>
.html-wrapper {
  font-family: Consolas, monospace, 'Courier New';
  white-space: pre-wrap;
}
</style>
