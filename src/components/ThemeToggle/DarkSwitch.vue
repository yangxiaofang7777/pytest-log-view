<script setup lang="ts">
// for now el-switch does not support customized icon in the dot
// we will implement a simple version of el-switch then update the switch
// component for this feature
</script>

<template>
  <div class="switch" role="switch">
    <div class="switch__action">
      <div class="switch__icon">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.switch {
  margin: 0;
  display: inline-block;
  position: relative;
  width: 40px;
  height: 20px;
  border: 1px solid var(--el-border-color);
  outline: none;
  border-radius: 10px;
  box-sizing: border-box;
  background: var(--el-bg-color-page);
  cursor: pointer;
  transition: border-color var(--el-transition-duration), background-color var(--el-transition-duration);

  &__action,
  &__icon {
    width: 16px;
    height: 16px;
  }

  &__action {
    position: absolute;
    top: 1px;
    left: 1px;
    border-radius: 50%;
    background-color: var(--el-bg-color);
    transform: translate(0);
    color: var(--el-text-color-light);
    transition: border-color var(--el-transition-duration), background-color var(--el-transition-duration), transform var(--el-transition-duration);
  }

  &__icon {
    position: relative;

    .el-icon {
      position: absolute;
      left: 1px;
      bottom: 1px;
    }
  }

}

.dark .switch__action {
  transform: translate(20px);
}
</style>
