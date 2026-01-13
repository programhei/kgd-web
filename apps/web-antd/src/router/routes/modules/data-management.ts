import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:database-zap',
      order: -1,
      // 直接显示为一级菜单「权值更新」
      title: $t('page.dataManagement.weightUpdate'),
      hideChildrenInMenu: true,
    },
    name: 'DataManagement',
    path: '/weight-update-root',
    redirect: '/weight-update',
    children: [
      {
        name: 'WeightUpdate',
        path: '/weight-update',
        // @ts-ignore
        component: () => import('../../../views/data-management/weight-update.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:hammer',
          // 标签名与左侧菜单保持一致：使用「权值更新」
          title: $t('page.dataManagement.weightUpdate'),
        },
      },
      {
        name: 'FusionData',
        path: '/fusion-data',
        // @ts-ignore
        component: () => import('../../../views/data-management/fusion-data.vue'),
        meta: {
          icon: 'lucide:layout-template',
          title: '融合数据',
        },
      },
    ],
  },
];
export default routes;
