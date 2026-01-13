<script setup lang="ts">
import type {ToolbarType} from './types';

import {computed} from 'vue';

import {preferences} from '@vben/preferences';
import avatar from '../../../common-ui/src/assets/images/avatar.png'

import {
  AuthenticationColorToggle,
  AuthenticationLayoutToggle,
  LanguageToggle,
  ThemeToggle, UserDropdown,
} from '../widgets';
import {useUserStore} from "@vben/stores";
import {useAuthStore} from "../../../../../apps/web-antd/src/store";
interface Props {
  toolbarList?: ToolbarType[];
}

defineOptions({
  name: 'AuthenticationToolbar',
});

const props = withDefaults(defineProps<Props>(), {
  toolbarList: () => ['color', 'language', 'layout', 'theme'],
});

const showColor = computed(() => props.toolbarList.includes('color'));
const showLayout = computed(() => props.toolbarList.includes('layout'));
const showLanguage = computed(() => props.toolbarList.includes('language'));
const showTheme = computed(() => props.toolbarList.includes('theme'));
const showUser = computed(() => props.toolbarList.includes('user'));
const userStore = useUserStore();
const authStore = useAuthStore();
async function handleLogout() {
  await authStore.logout(false);
}
</script>

<template>
  <div
    :class="{
      'bg-accent rounded-3xl px-3 py-1': toolbarList.length > 1,
    }"
    class="flex-center absolute right-2 top-4 z-10"
  >
    <!-- Only show on medium and larger screens -->
    <div class="hidden md:flex">
      <AuthenticationColorToggle v-if="showColor"/>
      <AuthenticationLayoutToggle v-if="showLayout"/>
    </div>
    <!-- Always show Language and Theme toggles -->
    <LanguageToggle v-if="showLanguage && preferences.widget.languageToggle"/>
    <ThemeToggle v-if="showTheme && preferences.widget.themeToggle"/>
    <UserDropdown
      v-if="showUser"
      :avatar="avatar"
      :menus
      :text="userStore.userInfo?.realName"
      description="测试账户"
      tag-text="超级管理员"
      @logout="handleLogout"
    />
  </div>
</template>
