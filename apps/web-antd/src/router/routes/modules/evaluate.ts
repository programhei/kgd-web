import type {RouteRecordRaw} from 'vue-router';

import {BasicLayout} from '#/layouts';
import {$t} from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.functionalCompleteness.title'),
      // 只在菜单中显示一级「功能完整性评估」，不展开子菜单
      hideChildrenInMenu: true,
    },
    name: 'FunctionalCompleteness',
    path: '/functional-completeness',
    children: [
      {
        name: 'FlightSimulation',
        path: '/flight-simulation',
        component: () => import('#/views/evaluate/functional-completeness/flight-simulation.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:square-terminal',
          // 标签/面包屑显示为体系功能完备性评估
          title: $t('page.functionalCompleteness.title'),
        },
      },
      // {
      //   name: 'WeaponsSystem',
      //   path: '/weapon-system',
      //   component: () => import('#/views/evaluate/functional-completeness/weapons-system.vue'),
      //   meta: {
      //     affixTab: true,
      //     icon: 'lucide:square-terminal',
      //     title: $t('page.functionalCompleteness.weaponsSystem'),
      //   },
      // },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.performanceAccuracy.title'),
    },
    name: 'PerformanceAccuracy',
    path: '/performance-accuracy',
    children: [
      {
        name: 'FlightSimulationSystem',
        path: '/flight-simulation-system',
        component: () => import('#/views/evaluate/performance-accuracy/flight-simulation-system.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:square-terminal',
          title: $t('page.performanceAccuracy.flightSimulationSystem'),
        },
      },
      {
        name: 'RadarSimulationSystem',
        path: '/radar-simulation-system',
        component: () => import('#/views/evaluate/performance-accuracy/radar-simulation-system.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:square-terminal',
          title: $t('page.performanceAccuracy.radarSimulationSystem'),
        },
      },
      {
        name: 'MissileSimulationSystem',
        path: '/missile-simulation-system',
        component: () => import('#/views/evaluate/performance-accuracy/missile-simulation-system.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:server-crash',
          title: $t('page.performanceAccuracy.missileSimulationSystem'),
        },
      },
      {
        name: 'SimulationPerformanceAccuracyNew',
        path: '/simulation-performance-accuracy-new',
        component: () => import('#/views/evaluate/performance-accuracy/simulation-performance-accuracy-new.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:chart-line',
          title: $t('page.performanceAccuracy.simulationPerformanceAccuracyNew'),
        },
      },
      {
        name: 'SimulationAlgorithmManage',
        path: '/simulation-algorithm-manage',
        component: () => import('#/views/evaluate/performance-accuracy/algorithm-manage.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:list-checks',
          title: $t('page.performanceAccuracy.algorithmManage'),
        },
      },
      {
        name: 'MissileTrajectory',
        path: '/missile-trajectory',
        component: () => import('#/views/evaluate/performance-accuracy/missile-trajectory.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:crosshair',
          title: $t('page.performanceAccuracy.missileTrajectory'),
        },
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.scenarioRationality.title'),
      // 只在菜单中显示一级「想定合理性评估」，不展开子菜单
      hideChildrenInMenu: true,
    },
    name: 'ScenarioRationality',
    path: '/scenario-rationality',
    redirect: '/initial-task',
    children: [
      {
        name: 'InitialTask',
        path: '/initial-task',
        // component: () => import('#/views/evaluate/scenario-rationality/initial-task.vue'),
        component: () => import('#/views/evaluate/scenario-rationality.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:square-terminal',
          title: $t('page.scenarioRationality.initialTask'),
        },
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.intelligentDecisionModel.title'),
      // 只在菜单中显示一级「支持智能决策模型生成维度」
      hideChildrenInMenu: true,
    },
    name: 'IntelligentDecisionModel',
    path: '/intelligent-decision-model',
    redirect: '/adversarial-process',
    children: [
      {
        name: 'AdversarialProcess',
        path: '/adversarial-process',
        component: () => import('#/views/evaluate/intelligent-decision-model.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:square-terminal',
          title: $t('page.intelligentDecisionModel.adversarialProcess'),
        },
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.softwareQuality.title'),
      // 只在菜单中显示一级「软件质量评估」
      hideChildrenInMenu: true,
    },
    name: 'SoftwareQuality',
    path: '/software-quality',
    redirect: '/software-quality-assessment',
    children: [
      {
        name: 'SoftwareQualityAssessment',
        path: '/software-quality-assessment',
        // component: () => import('#/views/evaluate/software-quality/software-quality-assessment.vue'),
        component: () => import('#/views/evaluate/software-quality.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:square-terminal',
          title: $t('page.softwareQuality.softwareQualityAssessment'),
        },
      }
    ],
  },
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.sceneSetQuality.title'),
      // 只在菜单中显示一级「总体评估」
      hideChildrenInMenu: true,
    },
    name: 'SoftwareQuality1',
    path: '/software-quality1',
    redirect: '/software-quality-assessment1',
    children: [
      {
        name: 'SoftwareQualityAssessment1',
        path: '/software-quality-assessment1',
        // component: () => import('#/views/evaluate/software-quality/software-quality-assessment.vue'),
        component: () => import('#/views/data-management/weightTotalScore.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:square-terminal',
          title: $t('page.sceneSetQuality.scoreDisplay'),
        },
      }
    ],
  }
];
export default routes;
