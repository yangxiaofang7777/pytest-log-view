<script setup lang="ts">
import DarkIcon from './DarkIcon.vue'
import LightIcon from './LightIcon.vue'
import DarkSwitch from './DarkSwitch.vue'
import { ElIcon } from 'element-plus'

</script>

<template>
  <div class="theme-toggle-content" title="主题切换">
    <DarkSwitch>
      <ElIcon :size="13">
        <DarkIcon class="dark-icon" />
        <LightIcon class="light-icon" />
      </ElIcon>
    </DarkSwitch>
  </div>
</template>

<style lang="scss" scoped>
.theme-toggle-content {
  height: 24px;
  padding: 0 12px;
  display: flex;
  align-items: center;
}

.el-icon {
  cursor: pointer;
}

.dark-icon,
.light-icon {
  transition: color var(--el-transition-duration),
    opacity var(--el-transition-duration);
}

.light-icon {
  opacity: 1;
  position: absolute;
  top: 0;
  left: 0;
}

.dark-icon {
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
}

@at-root .dark {
  .dark-icon {
    opacity: 1;
  }

  .light-icon {
    opacity: 0;
  }
}
</style>
