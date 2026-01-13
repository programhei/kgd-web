<script lang="ts" setup>
import {v4 as uuid} from 'uuid'
import {Home} from '@vben/common-ui'
import {useUserStore} from "@vben/stores";
import {useAuthStore} from "#/store";


// 模块数据集
const block_data = [
  {
    key: uuid(),
    title: '权值更新',
    icon: 'weight-update',
    path: '/weight-update',
    children: []
  },
  {
    key: uuid(),
    title: '要素评估',
    icon: 'element-evaluation',
    path: '/flight-simulation',
    children: [
      {
        key: uuid(),
        title: '体系功能评估',
        icon: 'system-functions',
        path: '/flight-simulation'
      },
      {
        key: uuid(),
        title: '性能准确度评估',
        icon: 'performance-accuracy',
        path: '/performance-accuracy-evaluate'
      },
      {
        key: uuid(),
        title: '想定合理性评估',
        icon: 'reasonable-assumption',
        path: '/scenario-rationality-evaluate'
      },
      {
        key: uuid(),
        title: '软件质量评估',
        icon: 'software-quality',
        path: '/software-quality-evaluate'
      },
      {
        key: uuid(),
        title: '支持智能决策模型生成与评估',
        icon: 'intelligent-decision-making',
        path: '/intelligent-decision-model-evaluate'
      }
    ]
  },
  {
    key: uuid(),
    title: '总体评估',
    icon: 'overall-evaluation',
    path: '/software-quality-assessment1',
    //path: '/scene-set-quality-evaluate',
    children: []
  },
]

const authStore = useAuthStore();
const userStore = useUserStore();

async function handleLogout() {
  await authStore.logout(false);
}
</script>

<template>
  <div class="h-full w-full">
    <Home :blocks="block_data"/>
  </div>
</template>
