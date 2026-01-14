<script lang="ts" setup>
import { computed } from 'vue';
import HtmlView from './HtmlView.vue'
import CmdView from './CmdView.vue'
import JsonView from './JsonView.vue'
import LinkView from './LinkView.vue'

const props = defineProps({
  data: {
    type: [String, Number, Boolean],
    required: true
  }
})

const dataType = computed(() => {
  if (typeof props.data !== 'string') return 'STRING'
  if (props.data.startsWith('_JSON')) return 'JSON'
  if (props.data.startsWith('_CMD')) return 'CMD'
  if (props.data.startsWith('_HTML')) return 'HTML'
  if (props.data.startsWith('_LINK')) return 'LINK'
  return 'STRING'
})

</script>

<template>
  <div class="view-wrapper">
    <div class="string-content" v-if="dataType === 'STRING'">{{ data }}</div>
    <HtmlView v-else-if="dataType === 'HTML'" :data="data as string" />
    <CmdView v-else-if="dataType === 'CMD'" :data="data as string" />
    <JsonView v-else-if="dataType === 'JSON'" :data="data as string" />
    <LinkView v-else-if="dataType === 'LINK'" :data="data as string" />
  </div>
</template>

<style lang="scss" scoped></style>
