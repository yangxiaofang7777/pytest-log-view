<script lang="ts" setup>
import { ElConfigProvider } from 'element-plus'
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import AppConfig from './components/AppConfig/AppConfig.vue';


import { useDark } from '@vueuse/core'
import { provide, ref, toRaw, watch } from 'vue';
import type { IAppConfig } from './types';

const isDark = useDark()

let storeAppConfig = {
  autoExpandFail: false
}

try {
  const storeAppConfigString = window.localStorage.getItem('appConfig')
  if (storeAppConfigString) storeAppConfig = JSON.parse(storeAppConfigString)
} catch (e) {
  console.log(e)
}

const appConfig = ref(storeAppConfig as IAppConfig)

provide('isDark', isDark)
provide('appConfig', [appConfig, (data: IAppConfig) => appConfig.value = data])

watch(() => appConfig.value, (value) => {
  localStorage.setItem('appConfig', JSON.stringify(toRaw(value)))
})

</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <RouterView />
    <div class="app-setting-wrapper">
      <AppConfig />
    </div>
  </ElConfigProvider>
</template>


<style lang="scss" scoped>
.app-setting-wrapper {
  position: fixed;
  height: 40px;
  padding: 0 10px;
  top: 0;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
}
</style>
