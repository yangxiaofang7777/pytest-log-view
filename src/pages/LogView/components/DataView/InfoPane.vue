<script lang="ts" setup>
import { inject, onMounted, ref, type PropType } from "vue";
import { ElButton, ElMessageBox } from "element-plus"
import { Plus, Minus } from "@element-plus/icons-vue"
import { computed } from "vue";
import type { ProviderAppConfig, Result } from "@/types";
const props = defineProps({
  dataId: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    required: true
  },
  titleData: {
    type: String,
    required: true
  },
  layerData:{
    type: String,
    required: true
  },
  paneState: {
    type: String as PropType<Result>,
    default: ''
  },
  parentId: {
    type: String,
    required: true
  },
  borderType: {
    type: String as PropType<'solid' | 'dashed'>,
    default: 'dashed'
  },
  moreInfo: {
    type: String
  }
})

const [appConfig] = inject('appConfig') as ProviderAppConfig

const paneClass = computed(() => {
  // PASS INFO WARNING ERROR (NOT TEST) UNFINISHED
  if (['PASS', 'INFO'].includes(props.paneState)) return 'pass'  // 绿色
  if (['FAIL', 'ERROR', 'Error'].includes(props.paneState)) return 'fail'  // 红色
  if (['NOT TEST', 'UNFINISHED', 'WARNING'].includes(props.paneState)) return 'warning'  // 黄色
  return 'normal'  // 灰色
})

const isShowContent = ref(false)
const domRef = ref({} as HTMLElement)

const keyupHandle = (e: KeyboardEvent) => {
  if (e.key != 'Enter') return
  isShowContent.value = !isShowContent.value
}

const focusHandle = () => {
  domRef.value.addEventListener('keyup', keyupHandle)
}

const blurHandle = () => {
  domRef.value.removeEventListener('keyup', keyupHandle)
}

const openAllTitle = (title: string) => {
  ElMessageBox.alert(title, '完整标题', {
    confirmButtonText: '关闭'
  })
}


onMounted(() => {
  setTimeout(async () => {
    if (props.paneState === 'FAIL' || props.paneState === 'ERROR') {
      if (appConfig.value.autoExpandFail) isShowContent.value = true
    }
  }, 500);
})

</script>

<template>
  <div :class="['info-pane', paneClass, borderType]" :id="`${parentId}_|_${dataId}`" tabindex="-1" @focus="focusHandle"
    @blur="blurHandle" ref="domRef" :layerData="layerData">
    <div class="header" @click="() => isShowContent = !isShowContent">
      <ElButton class="icon-btn" :icon="isShowContent ? Minus : Plus" size="small" />
      <span :class="['tag', paneClass]" v-if="tag">{{ tag }}</span>
      <span :class="['info-title', paneClass]" v-if="titleData" :title="titleData">{{ titleData }}</span>
      <ElButton class="allTitleButtonClass" size="small" @click.stop="openAllTitle(titleData)">查看完整标题</ElButton>
      <div class="more-info">{{ moreInfo }}</div>
    </div>
    <div class="content" v-if="isShowContent">
      <slot />
    </div>
  </div>
</template>

<style>
.el-message-box__message {
    /* p {
        white-space: pre;
    } */
}
</style>

<style lang="scss" scoped>
.allTitleButtonClass{
  margin: 0 8px;
}

.info-pane {
  padding: 4px;
  margin-bottom: 4px;

  &.solid {
    border: 1px solid var(--el-text-color-placeholder);
  }

  &.dashed {
    border: 1px dashed var(--el-text-color-placeholder);
  }

  &:focus {
    background-color: var(--el-fill-color);
  }



  &.pass {
    .tag {
      background-color: var(--el-color-success);
      border-radius: 3px;
    }
  }

  &.fail {
    .tag {
      background-color: var(--el-color-error);
    }
  }

  &.warning {
    .tag {
      background-color: var(--el-color-warning);
    }
  }

  &.normal {
    .tag {
      background-color: var(--el-color-info);
    }
  }


  .header {
    cursor: pointer;
    padding: 4px;
    border: 1px solid #00000000;
    display: flex;
    flex-direction: row;
    align-items: center;

    .icon-btn {
      padding: 5px;
    }



    .tag {
      padding: 4px;
      font-size: 12px;
      margin: 0 4px;
      font-weight: bold;
      word-break: keep-all;
      color: var(--el-color-info-light-9);
      white-space: nowrap;
      border-radius: 3px;

      &.normal {
        background-color: var(--el-color-primary);
      }

      &.pass {
        background-color: var(--el-color-success);
      }

      &.warning {
        background-color: var(--el-color-warning);
      }

      &.normal {
        background-color: var(--el-color-info);
      }
    }

    .info-title {
      font-weight: 700;
      flex-grow: 1;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 13px;
      padding-right: 8px;
      word-break: break-all;

      &.fail {
        color: var(--el-color-error);
      }
    }

    .more-info {
      color: var(--el-text-color-secondary);
    }

    &:hover {
      background-color: var(--el-bg-color-page);
      border: 1px solid var(--el-border-color);
    }
  }

  .content {
    padding: 4px 4px 4px 24px;
  }
}
</style>
