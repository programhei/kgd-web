<script lang="ts" setup>
import {computed} from 'vue';

import {AuthPageLayout} from '@vben/layouts';
import {preferences} from '@vben/preferences';

import {$t} from '#/locales';
import logoImage from '../../../../packages/effects/common-ui/src/assets/images/logo.png';

// const appName = computed(() => preferences.app.name);
const logo = computed(() => logoImage);
const appName = ''
</script>

<template>
  <AuthPageLayout
    :app-name="appName"
    :logo="logo"
    :copyright="false"
    :page-description="$t('authentication.pageDesc')"
    :page-title="$t('authentication.pageTitle')"
    :title-above-image="'无人机自主空战对抗场景集质量评估工具'"
  >
    <!-- 自定义工具栏 -->
    <!-- <template #toolbar></template> -->
  </AuthPageLayout>
</template>
