<script lang="ts" setup>
import type {VbenFormSchema} from '@vben/common-ui';
import type {BasicOption} from '@vben/types';
import {getRolesApi} from '#/api'
import {computed, markRaw, onMounted} from 'vue';

import {AuthenticationLogin, SliderCaptcha, z} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {useAuthStore} from '#/store';

defineOptions({name: 'Login'});

const authStore = useAuthStore();

// 角色列表
const ROLE_OPTIONS: BasicOption[] = [];

onMounted(() => {
  //  获取角色信息
  getRolesApi().then(res => {
    res.forEach(data => {
      ROLE_OPTIONS.push({
        label: data.roleName,
        value: data.roleKey,
        userList: data.userList
      })
    })
  })
})

//  用户列表
const USER_OPTIONS: BasicOption[] = [];

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenSelect',
      componentProps: {
        options: ROLE_OPTIONS,
        placeholder: $t('authentication.selectAccount'),
      },
      fieldName: 'selectAccount',
      label: $t('authentication.selectAccount'),
      rules: z
        .string()
        .min(1, {message: $t('authentication.selectAccount')})
        .optional()
        .default(''),
      dependencies: {
        trigger(values, form) {
          if (values.selectAccount) {
            const findRole = ROLE_OPTIONS.find(
              (item) => item.value === values.selectAccount,
            );
            if (findRole && findRole.userList) {
              findRole.userList.forEach(user => {
                USER_OPTIONS.push({
                  label: user.userName,
                  value: user.userName,
                })
              })
            }
          }
        },
        triggerFields: ['selectAccount'],
      },
    },
    {
      component: 'VbenSelect',
      componentProps: {
        options: USER_OPTIONS,
        placeholder: $t('authentication.username'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, {message: $t('authentication.usernameTip')}),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, {message: $t('authentication.passwordTip')}),
    },
    {
      component: markRaw(SliderCaptcha),
      fieldName: 'captcha',
      rules: z.boolean().refine((value) => value, {
        message: $t('authentication.verifyRequiredTip'),
      }),
    },
  ];
});
</script>

<template>
  <div class="login-wrapper">
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
      title=" "
      sub-title=" "
    @submit="authStore.authLogin"
  />
  </div>
</template>

<style scoped>
.login-wrapper :deep(div.mb-7) {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>
