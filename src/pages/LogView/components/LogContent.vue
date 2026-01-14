<script lang="ts" setup>
import type {ProviderLogData, Dir, Script} from '@/types';
import {inject, provide, ref, watch} from 'vue';
import ObjectView from './DataView/ObjectView.vue'
import StatisticsView from './DataView/StatisticsView.vue';
import {ElEmpty, ElBacktop, ElTree, ElButton, ElPopover, ElSwitch, ElDivider} from 'element-plus'
import JsonViewDialog from './DataView/JsonViewDialog.vue'
import {WarningFilled} from "@element-plus/icons-vue";
import {decode} from "js-base64";

const [logData] = inject('logData') as ProviderLogData

const jsonViewDialogRef = ref({} as HTMLElement)

provide('jsonViewDialogRef', jsonViewDialogRef)

const isShowUnimportant = ref(false)
const isShowDebugLog = ref(false)

const errorTree = ref<{
  label: string,
  children: any[],
  Result: string,
  key: string
}[]>([])

watch(() => logData.value, (value) => {
  if (value) {
    console.log(value, "value")
    if (value.scripts) {
      errorTree.value = buildErrorArray(value as Dir)
    } else {
      let tree = getErrorTree(value as Script, 0)
      console.log(tree, "tree")
      if (tree) {
        errorTree.value = [tree]
      }
    }
  }
})

const buildErrorArray = (value: Dir) => {
  let scripts = value.scripts
  let errorTree: any[] = []
  scripts.forEach((script, index) => {
    let tree = getErrorTree(script, index)
    if (tree) {
      errorTree.push(tree)
    }
  })
  console.log(errorTree, "errorTree")
  return errorTree
};

const getErrorTree = (script: Script, index: number = 0): {
  label: string,
  children: any[],
  Result: string,
  key: string,
  layer: string,
  ng_summary_message?: string
} | undefined => {
  // if (logData?.value?.scripts) {
  let treeData:any = {
    label: "",
    children: [],
    Result: "",
    key: "0",
    layer: "",
    ng_summary_message: "",
    Error_occurred: ""
  }
  
  const parseObjectToTree = (obj: any, parentKey = "", firstTitle = "") => {
    let treeNode:any = {
      label: "",
      children: [],
      Result: "",
      key: parentKey ? `${parentKey}-${obj.Title?.[1] ? decode(obj.Title[1].replace('_HTML:b', '')) : ""}` : "0",
      layer: "",
      ng_summary_message: "",
      Error_occurred: ""
    }
    
    for (let key in obj) {
      if (key === "Result") {
        treeNode.Result = obj[key]
        if (treeNode.Result === "PASS" || treeNode.Result === "INFO") {
          return null
        }
      } else if (key === "Title") {
        let title = obj[key][1]
        if (title.startsWith('_HTML:b')) {
          title = title.replace('_HTML:b', '')
          treeNode.label = decode(title)
        }
      } else if (key === "layer") {
        treeNode.layer = firstTitle + " " + obj[key]
      } else if (key === "ng_summary_message") {
        treeNode.ng_summary_message = obj[key]
      } else if (key === "Error_occurred") {
        let Error_occurred = obj[key]
        if (Error_occurred.startsWith('_HTML:b')) {
          Error_occurred = Error_occurred.replace('_HTML:b', '')
          treeNode.Error_occurred = decode(Error_occurred)
        } else {
          treeNode.Error_occurred = obj[key]
        }
      } else {
        if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
          const childNode= parseObjectToTree(obj[key], treeNode.key, firstTitle)
          if (childNode) {
            treeNode.children.push(childNode)
          }
        } else if (Object.prototype.toString.call(obj[key]) === '[object Array]') {
          for (let item of obj[key]) {
            if (Object.prototype.toString.call(item) === '[object Object]') {
              const childNode = parseObjectToTree(item, treeNode.key, firstTitle)
              if (childNode) {
                treeNode.children.push(childNode)
              }
            }
          }
        }
      }
    }
    
    return treeNode
  }
  
  if (script) {
    for (let key1 in script) {
      let firstTitle = script["Title"][1]
      if (firstTitle.startsWith('_HTML:b')) {
        firstTitle = firstTitle.replace('_HTML:b', '')
        firstTitle = decode(firstTitle) + index
      }
      
      if (key1 === "Result") {
        treeData.Result = script[key1]
        if (treeData.Result === "PASS" || treeData.Result === "INFO") {
          return undefined
        }
      } else if (key1 === "Title") {
        let title = script[key1][1]
        if (title.startsWith('_HTML:b')) {
          title = title.replace('_HTML:b', '')
          treeData.label = decode(title)
        }
      } else if (key1 === "layer") {
        treeData.layer = firstTitle + " " + script[key1]
      } else if (key1 === "ng_summary_message") {
        treeData.ng_summary_message = script[key1]
      } else if (key1 === "Error_occurred") {
        let Error_occurred = script[key1]
        if (Error_occurred.startsWith('_HTML:b')) {
          Error_occurred = Error_occurred.replace('_HTML:b', '')
          treeData.Error_occurred = decode(Error_occurred)
        } else {
          treeData.Error_occurred = script[key1]
        }
      } else {
        if (Object.prototype.toString.call(script[key1]) === '[object Object]') {
          const childNode = parseObjectToTree(script[key1], treeData.key, firstTitle)
          if (childNode) {
            treeData.children.push(childNode)
          }
        } else if (Object.prototype.toString.call(script[key1]) === '[object Array]') {
          for (let item of script[key1]) {
            if (Object.prototype.toString.call(item) === '[object Object]') {
              const childNode = parseObjectToTree(item, treeData.key, firstTitle)
              if (childNode) {
                treeData.children.push(childNode)
              }
            }
          }
        }
      }
    }
    
    return treeData
  }
  // }
  return undefined
}

const findMatchingNodes = (tree: any[], targetLabel: string): any[] => {
  const matches: any[] = [];
  const traverse = (node: any) => {
    if (node.label === targetLabel) {
      matches.push(node);
    }
    if (node.children) {
      node.children.forEach((child: any) => traverse(child));
    }
  };
  tree.forEach(node => traverse(node));
  return matches;
}

const clickErrorTree = (data: any, node: { level: number; parent: any; label: string ; id?:any}, treeNode: any) => {
  if (data.layer) {
    console.log("新版有layer日志", data)
    let layerArr: string[] = data.layer.split(" ")
    let lastDivElement: HTMLElement | null = null;
    layerArr.forEach(async (item, index) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      let divElement: HTMLElement | null = null;
      if (index === 0) {
        divElement = document.querySelector(`div[layerdata="${item}"]`) as HTMLElement;
      } else {
        let layerData = item
        if (index > 1) {
          let layerDataArr = layerArr.slice(1, index + 1)
          layerData = layerDataArr.join(" ")
        }
        divElement = document.querySelector(`div[layerdata="${layerArr[0]}"]`)?.querySelector(`div[layerdata="${layerData}"]`) as HTMLElement
      }
      if (divElement) {
        const elementChildren = divElement.children as unknown as HTMLElement[];
        if (elementChildren.length === 1) {
          elementChildren[0].click()
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        divElement.children[1].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        if (lastDivElement) {
          lastDivElement.classList.remove("highlight-animation");
        }
        
        if (index === layerArr.length - 1) {
          divElement.children[0].classList.add("highlight-animation");
          setTimeout(() => {
            divElement?.children[0].classList.remove("highlight-animation");
          }, 5000);
        }
        
        lastDivElement = divElement?.children[0] as HTMLElement;
      }
    })
  } else {
    console.log("旧版无layer日志")
    const labels = []
    for (let tempNode = node; tempNode.level >= 1; tempNode = tempNode.parent) {
      labels.unshift(tempNode.label)
    }
    
    const matchingNodes = findMatchingNodes(errorTree.value, data.label);
    let clickIndex = matchingNodes.findIndex(matchingNode => matchingNode.$treeNodeId === node.id);
    
    let lastParentEl: Element | null = null;
    
    labels.forEach(async (item, index) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const spanElements = document.querySelectorAll(`span[title="${item}"]`);
      let spanElement:any = null
      if (spanElements.length === 1) {
        spanElement = spanElements[0]
      } else {
        spanElement = spanElements[clickIndex];
      }
      if (spanElement) {
        const parentEl = spanElement.parentElement;
        const siblingEl = parentEl?.nextElementSibling;
        if (!siblingEl?.className?.includes("content")) {
          spanElement.click();
        }
        
        spanElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        if (lastParentEl) {
          lastParentEl.classList.remove("highlight-animation");
        }
        
        if (index === labels.length - 1) {
          parentEl?.classList.add("highlight-animation");
          setTimeout(() => {
            parentEl?.classList.remove("highlight-animation");
          }, 5000);
        }
        
        lastParentEl = parentEl;
      }
    })
  }
}

const paneClass = (data: {
  label: string,
  children: any[],
  Result: string,
  key: string,
  layer: string,
  ng_summary_message?: string
}) => {
  // PASS INFO WARNING ERROR (NOT TEST) UNFINISHED
  if (['PASS', 'INFO'].includes(data.Result)) return 'pass'  // 绿色
  if (['FAIL', 'ERROR', 'Error'].includes(data.Result)) return 'fail'  // 红色
  if (['NOT TEST', 'UNFINISHED', 'WARNING'].includes(data.Result)) return 'warning'  // 黄色
  return 'normal'  // 灰色
}

</script>

<template>
  <div class="log-content" id="logContent">
    <template v-if="logData">
      <template v-if="logData.scripts">
        <h3>Test Statistics</h3>
        <StatisticsView :data="logData as Dir"/>
        <h3>Test Execution Log</h3>
        <ObjectView :isShowUnimportant="isShowUnimportant" :isShowDebugLog="isShowDebugLog" v-for="(scriptItem, index) in (logData as Dir).scripts" :key="index" :data="scriptItem"
                    parent-id="dir" :data-id="`script ${index + 1}`" border-type="solid" :index="index + 1"/>
      </template>
      <template v-else>
        <h3>Test Execution Log</h3>
        <ObjectView :isShowUnimportant="isShowUnimportant" :isShowDebugLog="isShowDebugLog" :data="logData as Script" parent-id="dir" data-id="script" border-type="solid"/>
      </template>
    </template>
    <template v-else>
      <ElEmpty description="请加载数据进行显示"/>
    </template>
    <ElBacktop target="#logContent"/>
  </div>
  <JsonViewDialog ref="jsonViewDialogRef"/>
  
  <div
    style="position:fixed;top: 60px;right: 20px;display: flex;align-items: center;justify-content: flex-end;gap: 15px">
    <ElSwitch v-model="isShowDebugLog" :active-value="true" :inactive-value="false" active-text="展示调试日志"
              inactive-text="隐藏调试日志"></ElSwitch>
    
    <ElDivider direction="vertical"/>
    
    <ElSwitch v-model="isShowUnimportant" :active-value="true" :inactive-value="false" active-text="展示不重要步骤"
              inactive-text="隐藏不重要步骤"></ElSwitch>
    
    <ElDivider direction="vertical"/>
    
    <ElPopover placement="right" width="800" trigger="click">
      <template #reference>
        <ElButton type="warning">
          <WarningFilled/>
          点击打开 Error 导航
        </ElButton>
      </template>
      <div>
        <div style="font-size: 17px;font-weight: bold; margin-bottom: 10px">点击节点导航到错误详情</div>
        <div style="width: 100%; max-height: 400px; overflow-y: auto">
          <ElTree :data="errorTree" default-expand-all :props="{children: 'children', label: 'label'}"
                  node-key="key"
                  :expand-on-click-node="false" highlight-current check-on-click-node
                  @node-click="clickErrorTree">
            <template #default="{ node, data }">
              <ElPopover v-if="!data.ng_summary_message && !data.Error_occurred" placement="top-start" width="600"
                         :show-after="200">
                <template #reference>
                  <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                       :class="paneClass(data)">
                    {{ node.label }}
                  </div>
                </template>
                <template #default>
                  <div style="white-space: pre-wrap">
                    {{ node.label }}
                  </div>
                </template>
              </ElPopover>
              <ElPopover v-else-if="data.ng_summary_message" placement="top-start" width="600" :show-after="200">
                <template #reference>
                  <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                       :class="paneClass(data)">
                    {{ data.ng_summary_message }}
                  </div>
                </template>
                <template #default>
                  <div style="white-space: pre-wrap">
                    {{ data.ng_summary_message }}
                  </div>
                </template>
              </ElPopover>
              <ElPopover v-else-if="data.Error_occurred" placement="top-start" width="600" :show-after="200">
                <template #reference>
                  <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                       :class="paneClass(data)">
                    {{ data.Error_occurred }}
                  </div>
                </template>
                <template #default>
                  <div style="white-space: pre-wrap">
                    {{ data.Error_occurred }}
                  </div>
                </template>
              </ElPopover>
            </template>
          </ElTree>
        </div>
      </div>
    </ElPopover>
  </div>
</template>

<style lang="scss" scoped>
.log-content {
  height: calc(100% - 40px);
  width: 100%;
  overflow: auto;
  padding: 10px;
  background-color: var(--el-bg-color-overlay);
  
  h3 {
    margin: 10px 0;
    font-weight: bold;
  }
  
  .log-title {
    padding: 0 10px;
    height: 38px;
    line-height: 38px;
    font-size: 22px;
    background-color: var(--el-fill-color);
  }
  
  .suit-content {
    width: 100%;
    padding: 6px;
    box-sizing: border-box;
  }
}

:deep(.el-tree-node__content) {
  color: var(--el-color-error);
  font-size: 15px;
}

.pass {
  color: #5cb85c;
}

.fail {
  color: #d9534f;
}

.warning {
  color: #ec971f;
}

.normal {
  color: #49b1a3;
}
</style>

<style>
@keyframes highlight {
  0% {
    background: var(--el-color-error);
  }
  50% {
    background: #ffd04b;
  }
  100% {
    background: var(--el-color-error);
  }
}

.highlight-animation {
  animation: highlight 2s linear infinite normal;
}
</style>
