<script lang="ts" setup>
import type { Dir, StatisticsItem } from "@/types";
import { ElTable, ElTableColumn } from "element-plus"
import { computed, nextTick, type PropType } from "vue";
import { decode } from 'js-base64';

const props = defineProps({
  data: {
    type: Object as PropType<Dir>,
    required: true
  }
})

const parseTime = (strValue: string) => {
  const res = [0, 0, 0]
  try {
    const strArr = strValue.split(':').map(item => Number(item))
    if (strArr[0]) res[0] = strArr[0]
    if (strArr[1]) res[1] = strArr[1]
    if (strArr[2]) res[2] = Number(strArr[2].toFixed(3))
  } catch (e) {
    console.log(e)
  }
  return res
}

const getMsFromTimeArr = (time: number[]) => {
  let ms = 0
  if (time[2]) ms += time[2] * 1000
  if (time[1]) ms += time[1] * 60 * 1000
  if (time[0]) ms += time[0] * 60 * 60 * 1000
  return ms
}

const getTimeArrFromMs = (ms: number) => {
  let restMs = ms
  const res = [0, 0, 0]
  res[0] = Math.floor(restMs / (60 * 60 * 1000))
  restMs = restMs % (60 * 60 * 1000)
  res[1] = Math.floor(restMs / (60 * 1000))
  restMs = restMs % (60 * 1000)
  res[2] = restMs / 1000
  return res
}

const addTime = (time1: number[], time2: number[]) => {
  const time1Ms = getMsFromTimeArr(time1)
  const time2Ms = getMsFromTimeArr(time2)
  const resMs = time1Ms + time2Ms
  return getTimeArrFromMs(resMs)
}

const compuData = computed(() => {
  const res = [] as StatisticsItem[]
  const scriptResArr = [] as StatisticsItem[]
  for (let i = 0; i < props.data.scripts.length; i++) {
    const script = props.data.scripts[i];
    let scriptTitle = script['Title'][1]
    if (scriptTitle.startsWith('_HTML:b')) {
      scriptTitle = scriptTitle.replace('_HTML:b', '')
      scriptTitle = decode(scriptTitle)
      scriptTitle = scriptTitle.replaceAll(' ', '&nbsp;')
      scriptTitle = scriptTitle.replaceAll('\n', '<br />')
    }
    scriptResArr.push({
      dir: props.data.dir,
      script: scriptTitle,
      total: 0,
      pass: 0,
      fail: 0,
      elapsedTimeArr: parseTime(script.elapsed_time),
      domId: `dir_|_script ${i + 1}`,
      result: script.Result
    })
  }
  res.push({
    dir: props.data.dir,
    script: '',
    total: scriptResArr.length,
    pass: scriptResArr.filter(item => item.result === 'PASS').length,
    fail: scriptResArr.filter(item => item.result === 'FAIL').length,
    elapsedTimeArr: scriptResArr.map(item => item.elapsedTimeArr).reduce((pre, cur) => addTime(pre, cur)),
    domId: 'dir',
    result: scriptResArr.filter(item => item.result === 'FAIL').length === 0 ? 'PASS' : 'FAIL',
    children: scriptResArr
  })
  return res
})

const renderScript = (row: StatisticsItem) => {
  if (row.script) return `${row.dir} · ${row.script}`
  return row.dir
}


const scriptClickHandle = async ({ domId }: StatisticsItem, e: MouseEvent) => {
  e.preventDefault()
  const dom = document.getElementById(domId)
  if (dom) {
    dom.focus()
    const contentDom = dom.querySelector('.content');
    if (!contentDom) {
      const headerDom = dom.querySelector('.header');
      if (headerDom) headerDom.dispatchEvent(new MouseEvent('click'))
    }
    return
  }
  const domIds = domId.split('_|_')
  const targetIds = [] as string[]
  for (let i = 0; i < domIds.length; i++) {
    targetIds.push(domIds[i])
    const targetId = targetIds.join('_|_')
    const targetDom = document.getElementById(targetId)
    if (targetDom) {
      targetDom.focus()
      const headerDom = targetDom.querySelector('.header');
      if (headerDom) {
        headerDom.dispatchEvent(new MouseEvent('click'))
        await nextTick()
      }
    }
  }
}

</script>

<template>
  <div class="statistics-view">
    <div class="table-wrapper">
      <ElTable border :data="compuData" size="small" fit max-height="300px" row-key="domId" default-expand-all>
        <ElTableColumn label="Script">
          <template #default="{ row }">
            <a :href="`#${row.domId}`" :class="['link', row.result]" @click="(e) => scriptClickHandle(row, e)">{{
              renderScript(row) }}</a>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Total" prop="total" width="100" />
        <ElTableColumn label="PASS" prop="pass" width="100" />
        <ElTableColumn label="FAIL" prop="fail" width="100" />
        <ElTableColumn label="Elapsed" width="120">
          <template #default="{ row }">
            <div class="elapsed">
              <span :class="['time', row.result]">{{ row.elapsedTimeArr.join(":") }}</span>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.table-wrapper {
  width: 100%;
  max-width: 1000px;

  .link {
    font-weight: bold;

    &.FAIL,
    &.ERROR,
    &.UNFINISHED {
      color: var(--el-color-error);
    }

    &.PASS {
      color: var(--el-color-success)
    }
  }

  .elapsed {
    .time {
      font-weight: bold;
    }

    .FAIL,
    .ERROR,
    .UNFINISHED {
      color: var(--el-color-error);
    }

    .PASS {
      color: var(--el-color-success)
    }
  }
}
</style>