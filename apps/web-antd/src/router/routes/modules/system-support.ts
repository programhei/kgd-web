import type {RouteRecordRaw} from 'vue-router';

import {BasicLayout} from '#/layouts';
import {$t} from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:columns-settings',
      order: -1,
      title: $t('page.systemSupport.title'),
    },
    name: 'System',
    path: '/',
    children: [
      {
        name: 'UserPermissionsManagement',
        path: '/user-permissions-management',
        component: () => import('#/views/system/user-permissions-management.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:shield-user',
          title: $t('page.systemSupport.userPermissionsManagement'),
        },
      },
      {
        name: 'UserOperationLogs',
        path: '/user-operation-logs',
        component: () => import('#/views/system/user-operation-logs.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:logs',
          title: $t('page.systemSupport.userOperationLogs'),
        },
      },
    ],
  },
];
export default routes;
