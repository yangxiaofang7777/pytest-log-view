<script lang="ts" setup>
import { computed, provide, readonly, ref } from "vue"
import type { AppForm, AppType, LogData } from '@/types';
import LogContent from './components/LogContent.vue';
import LogHeader from './components/LogHeader.vue';
import { useRoute } from "vue-router";
import { api_checkNetArea } from "@/util/area";

const appForm = ref({
  appType: 'LOCAL_FILE',
  url: '',
  file: '',
  title: ''
} as AppForm)

provide('appForm', [appForm, (data: AppForm) => appForm.value = data])

const logData = ref(null as LogData | null)
provide('logData', [logData, (data: LogData) => logData.value = data])


const route = useRoute()

const query = route.query
appForm.value.appType = query.appType as AppType
appForm.value.url = `/api/v1/logs/all-pytestlog-json?taskId=${(query.taskId as string) || ''}`
const isShowHeader = computed(() => {
  if (appForm.value.appType === 'LOCAL_FILE') return true
  if (appForm.value.appType === 'RESTAPI') {
    if (appForm.value.url) return true
  }
  if (appForm.value.appType === 'POST_MESSAGE') return true
  return false
})

const area = ref('green')
const checkNetArea = async() => {
  try {
    const res = await api_checkNetArea();
    res ? area.value = "yellow" : area.value = "green"
  } catch {
    area.value = "green";
  }
}

// checkNetArea()
provide('area', readonly(area))
</script>

<template>
  <div class="log-view">
    <LogHeader v-if="isShowHeader" />
    <LogContent />
  </div>
</template>

<style lang="scss" scoped>
.log-view {
  height: 100%;
  width: 100%;
  position: relative;
}
</style>