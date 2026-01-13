<script setup lang="ts">
import type { ToolbarType } from './types';

import { preferences, usePreferences } from '@vben/preferences';

import { Copyright } from '../basic/copyright';
import AuthenticationFormView from './form.vue';
import Toolbar from './toolbar.vue';
import loginBackgroundImage from '../../../common-ui/src/assets/images/login-backgrout.jpg';

interface Props {
  appName?: string;
  logo?: string;
  pageTitle?: string;
  pageDescription?: string;
  sloganImage?: string;
  toolbar?: boolean;
  copyright?: boolean;
  toolbarList?: ToolbarType[];
  titleAboveImage?: string;
  subtitleAboveImage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  appName: '空军工程大学',
  copyright: true,
  logo: '',
  pageDescription: '',
  pageTitle: '',
  sloganImage: '',
  toolbar: true,
  toolbarList: () => ['color', 'language', 'layout', 'theme'],
  titleAboveImage: '',
  subtitleAboveImage: '',
});

const { authPanelCenter, authPanelLeft, authPanelRight, isDark } =
  usePreferences();
</script>

<template>
  <div
    :class="[isDark]"
    class="flex min-h-full flex-1 select-none overflow-x-hidden relative"
    :style="{ backgroundImage: `url(${loginBackgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', minHeight: '100vh' }"
  >
    <template v-if="toolbar">
      <slot name="toolbar">
        <Toolbar :toolbar-list="toolbarList" />
      </slot>
    </template>
    <!-- 左侧认证面板 -->
    <AuthenticationFormView
      v-if="authPanelLeft"
      class="min-h-full w-2/5 flex-1"
      transition-name="slide-left"
    >
      <template v-if="copyright" #copyright>
        <slot name="copyright">
          <Copyright
            v-if="preferences.copyright.enable"
            v-bind="preferences.copyright"
          />
        </slot>
      </template>
    </AuthenticationFormView>

    <!-- 头部 Logo 和应用名称 -->
    <div v-if="logo || appName" class="absolute left-0 top-0 z-10 flex flex-1">
      <div
        class="text-foreground lg:text-foreground ml-4 mt-4 flex flex-1 items-center sm:left-6 sm:top-6"
      >
        <!-- <img v-if="logo" :alt="appName" :src="logo" class="mr-2" width="42" /> -->
        <p v-if="appName" class="text-xl font-medium">
          {{ appName }}
        </p>
      </div>
    </div>

    <!-- 系统介绍 -->
    <div v-if="!authPanelCenter" class="relative hidden w-0 flex-1 lg:block">
      <div
        class="absolute inset-0 h-full w-full"
        :style="{ backgroundImage: `url(${loginBackgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }"
      >
        <div class="login-background absolute left-0 top-0 size-full opacity-30"></div>
      </div>
    </div>
    
    <!-- 文字显示在页面中间，高度三分之二处 -->
    <div
      v-if="props.titleAboveImage || props.subtitleAboveImage"
      class="absolute left-3/2 z-20 text-center"
      style="top: 20.67%; transform: translate(calc(-50% + 80px), -50%);"
    >
      
    </div>

    <!-- 中心认证面板 -->
    <div v-if="authPanelCenter" class="flex-center relative w-full">
      <div class="login-background absolute left-0 top-0 size-full"></div>
      <AuthenticationFormView
        class="md:bg-background shadow-primary/5 shadow-float w-full rounded-3xl pb-20 md:w-2/3 lg:w-1/2 xl:w-[36%]"
      >
        <template v-if="copyright" #copyright>
          <slot name="copyright">
            <Copyright
              v-if="preferences.copyright.enable"
              v-bind="preferences.copyright"
            />
          </slot>
        </template>
      </AuthenticationFormView>
    </div>

    <!-- 右侧认证面板 -->
    <AuthenticationFormView
      v-if="authPanelRight"
      class="min-h-full w-[34%] flex-1 auth-panel-right"
    >
      <div v-if="props.titleAboveImage" class="text-foreground font-bold mb-4" style="font-size: 1.8rem; line-height: 2.25rem;">
        <span class="lg:hidden">{{ props.titleAboveImage }}</span>
        <span class="hidden lg:inline" style="font-size: 2.25rem; line-height: 2.75rem;">{{ props.titleAboveImage }}</span>
      </div>
      <div v-if="props.subtitleAboveImage" class="text-foreground/80" style="font-size: 1.35rem; line-height: 1.75rem;">
        <span class="lg:hidden">{{ props.subtitleAboveImage }}</span>
        <span class="hidden lg:inline" style="font-size: 1.5rem; line-height: 2rem;">{{ props.subtitleAboveImage }}</span>
      </div>
      <template v-if="copyright" #copyright>
        <slot name="copyright">
          <Copyright
            v-if="preferences.copyright.enable"
            v-bind="preferences.copyright"
          />
        </slot>
      </template>
    </AuthenticationFormView>
  </div>
</template>

<style scoped>
.login-background {
  background: linear-gradient(
    154deg,
    #07070915 30%,
    hsl(var(--primary) / 30%) 48%,
    #07070915 64%
  );
  filter: blur(100px);
}

.dark {
  .login-background {
    background: linear-gradient(
      154deg,
      #07070915 30%,
      hsl(var(--primary) / 20%) 48%,
      #07070915 64%
    );
    filter: blur(100px);
  }
}

/* 让登录框背景透明，显示背景图 */
:deep(.md\:bg-background),
:deep([class*="bg-background"]),
:deep(.bg-background) {
  background: transparent !important;
}

/* 右侧认证面板往左移动 */
.auth-panel-right {
  transform: translateX(-25%);
}
</style>
