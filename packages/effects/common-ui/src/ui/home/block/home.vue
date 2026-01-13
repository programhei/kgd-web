<script setup lang="ts">

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@vben-core/shadcn-ui';

import {LoginOutlined, UnorderedListOutlined, CloseCircleOutlined} from '@ant-design/icons-vue'

import {useRouter} from 'vue-router';

import {usePreferences} from "@vben-core/preferences";
import {VbenButton} from '@vben/common-ui'
import Toolbar from "../../../../../layouts/src/authentication/toolbar.vue";
import logo from '../../../assets/images/logo.png'
import loginBackgroundImage from '../../../assets/images/login-backgrout.jpg'
import {useIcon} from '../../../hook/useIcon'
import {ref} from "vue";

const router = useRouter();

interface Props {
  blocks: [];
}

const active = ref('')
withDefaults(defineProps<Props>(), {
  blocks: () => [],
});

function handleGo(path: string) {
  router.push(path);
}

function handleMouseenter(value) {
  if (value === active.value) {
    active.value = ''
    return;
  }
  active.value = value
}

function handleMouseleave(e) {
  active.value = ''
}

const toolbarList = ['color', 'language', 'theme', 'user']
const {isDark} = usePreferences();
</script>

<template>
  <div
    :class="[isDark]"
    :style="{ backgroundImage: `url(${loginBackgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }"
    class="flex min-h-full flex-1 flex-col select-none overflow-x-hidden flex-center gap-40 relative"
  >
    <!-- 渐变叠加层 -->
    <div 
      class="absolute inset-0"
      style="background: linear-gradient(154deg, rgba(7, 7, 9, 0.08235) 30%, hsl(var(--primary) / 20%) 48%, rgba(7, 7, 9, 0.08235) 64%);"
    ></div>
    <div class="left-2 absolute top-4 flex flex-center gap-2">
        <img :alt="'无人机自主空战对抗场景集质量评估工具'" :src="logo" class="mr-2" width="42"/>
        <CardTitle class="text-2xl" style="color: #ffffff;">
          无人机自主空战对抗场景集质量评估工具
        </CardTitle>
      </div>
      <Toolbar :toolbar-list="toolbarList"/>
      <div class="flex flex-row items-center justify-center gap-20 p-20 w-auto">
        <Card v-for="item  in blocks" :key="item.key" :title="item.title"
              class="h-auto w-[280px] cursor-pointer  border-b  shadow hover:border-blue-600 relative card-item-transparent">
          <CardHeader class="flex items-center justify-center w-full">
            <component :is="useIcon(item.icon)" class="h-[50px] w-[50px]"/>
          </CardHeader>
          <CardContent class="flex-col-center">
            <CardTitle class="text-xl">
              {{ item.title }}
            </CardTitle>
          </CardContent>
          <CardFooter v-if="item.children.length ===0">
            <VbenButton class="w-full gap-2"
                        @click="handleGo(item.path)">
              <LoginOutlined/>
              进入
            </VbenButton>
          </CardFooter>
          <CardFooter v-if="item.children.length !==0" class="flex gap-5">
            <VbenButton class="w-1/2 gap-2"
                        @click="handleGo(item.path)">
              <LoginOutlined/>
              直接进入
            </VbenButton>
            <VbenButton class="w-1/2 gap-2" @click="handleMouseenter(item.key)">
              <UnorderedListOutlined/>
              要素列表
            </VbenButton>
            <div class=" ml-3 w-[260px] h-full flex flex-center  list-card"
                v-if="item.children.length !==0 && active === item.key" >
            <a-list :data-source="item.children" class="w-full  ">
              <template #renderItem="{ item }">
                <a-list-item class="flex flex-center h-[40px]" @click="handleGo(item.path)">
                  <a-list-item-meta class="flex flex-center">
                    <template #title>
                      <a @click="handleGo(item.path)">{{ item.title }}</a>
                    </template>
                    <template #avatar>
                      <component :is="useIcon('elementIcon')" class="h-[20px] w-[30px]"/>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </div>
          </CardFooter>
          
        </Card>
      </div>
  </div>
</template>

<style scoped>
/* 内层卡片透明度 */
.card-item-transparent {
  background-color: rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(10px);
  overflow: visible; /* 允许下拉卡片溢出显示 */
  z-index: 1;
}

.dark .card-item-transparent {
  background-color: rgba(7, 7, 9, 0.4) !important;
}

.list-card{
  position: absolute;
  left: 100px;
  top: 0;
  z-index: 999999999;
  background: #fff;

}

</style>
