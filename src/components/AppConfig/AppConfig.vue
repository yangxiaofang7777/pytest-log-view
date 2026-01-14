<script lang="ts" setup>
import { ElPopover, ElButton, ElForm, ElFormItem, ElCheckbox } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import ThemeToggle from '../ThemeToggle/ThemeToggle.vue';
import { useToggle } from '@vueuse/core'
import { inject, type WritableComputedRef } from 'vue';
import type { IAppConfig, ProviderAppConfig } from '@/types';

const isDark = inject('isDark') as WritableComputedRef<boolean>
const toggleDark = useToggle(isDark)
const [appConfig, setAppConfig] = inject('appConfig') as ProviderAppConfig

const changeHandle = () => {
  let newConfig = {
    ...appConfig.value,
    autoExpandFail: !appConfig.value.autoExpandFail
  } as IAppConfig

  setAppConfig(newConfig)
}
</script>

<template>
  <div class="app-config-wrapper">
    <ElPopover width="260px">
      <template #reference>
        <ElButton :icon="Setting" text title="设置" />
      </template>
      <div class="config-content">
        <ElForm size="small" label-width="100px" label-position="left" label-suffix=":">
          <ElFormItem label="亮\暗模式">
            <ThemeToggle @click="() => toggleDark()" />
          </ElFormItem>
          <ElFormItem label="自动展开失败项">
            <ElCheckbox :model-value="appConfig.autoExpandFail" @change="() => changeHandle()" />
          </ElFormItem>
        </ElForm>
      </div>
    </ElPopover>
  </div>
</template>

<style lang="scss"></style>