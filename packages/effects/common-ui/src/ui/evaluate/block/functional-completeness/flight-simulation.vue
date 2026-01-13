<script setup lang="ts">
import { h, computed, ref } from 'vue'
import {
  DatabaseOutlined,
  DownloadOutlined,
  InboxOutlined,
  UploadOutlined,
  ExclamationOutlined
} from '@ant-design/icons-vue'
import {
  Card,
  CardContent,
  CardFooter
} from '@vben-core/shadcn-ui';
import {
  SendOutlined,
  ArrowRightOutlined
} from '@ant-design/icons-vue'
import '../index.css'
import original from '../../../../assets/images/original.png'
import { useUpload } from '../../../../hook/useUpload'
import WeaponsSystem from './weapons-system.vue'
import { message } from "ant-design-vue";

const props = defineProps({
  datasource: [],
  evaluateScore: null
})
// 传递事件
const emit = defineEmits<{
  'update:upload': [value: any],
  'update:loadData': [payload?: any],
  'update:deleteData': [value: any],
  'update:downloadTemplate': [value: any],
  'update:evaluate': [payload: any],
}>()

// 上传
const {
  fileList,
  uploading,
  beforeUpload,
  onRemove,
  onUploadChange,
  onSubmit
} = useUpload((fd, extra, dataType) => {
  emit('update:upload', { fd, extra, dataType })
})


const Empty = ref(original)
// 权值设定模态框打开状态
const opened = ref(false)
// 上传afSim数据记录
const afSim_visible = ref(false)
// 上传数据记录
const visible = ref(false)
// 权值数据
const weightData = computed(() => {
  return []
})
// 表格的单元
const columns_aerodynamic_parameter = ref(
  [
    // {
    //   title: '序号',
    //   dataIndex: 'serialNumber',
    //   key: 'serialNumber',
    //   align: 'center',
    //   ellipsis: true,
    // },
    // {
    //   title: '数据类型',
    //   dataIndex: 'dataType',
    //   key: 'dataType',
    //   width: 180,
    //   align: 'center',
    //   ellipsis: true,
    // },
    {
      title: '数据',
      dataIndex: 'dataContent',
      key: 'dataContent',
      width: 180,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '值类型',
      dataIndex: 'valueType',
      key: 'valueType',
      align: 'center',
      ellipsis: true,
    },
    // {
    //   title: '备注',
    //   dataIndex: 'remark',
    //   key: 'remark',
    //   align: 'center',
    //   ellipsis: true,
    // },
    {
      title: '是否缺失',
      dataIndex: 'isMissing',
      key: 'isMissing',
      align: 'center',
      ellipsis: true,
    },
  ]
)
// 气动参数数据
const aerodynamic_parameter_datasource = computed(() => {
  if (props.datasource && props.datasource.length > 0 && props.datasource[0]) {
    const item = props.datasource[0]
    // 支持嵌套数据结构：如果数据在 "飞行仿真" 键下，需要先提取
    let dataSource = item
    if (item['飞行仿真']) {
      dataSource = { ...item, ...item['飞行仿真'] }
    }
    // 优先查找 "气动参数"，如果没有则查找 "运动学模型、气动参数模型"
    return dataSource["气动参数"] || dataSource["运动学模型、气动参数模型"] || []
  }
  return []
})
// 表格的单元
const columns_kinematics = ref(
  [
    // {
    //   title: '序号',
    //   dataIndex: 'serialNumber',
    //   key: 'serialNumber',
    //   align: 'center',
    //   ellipsis: true,
    // },
    // {
    //   title: '数据类型',
    //   dataIndex: 'dataType',
    //   key: 'dataType',
    //   width: 180,
    //   align: 'center',
    //   ellipsis: true,
    // },
    {
      title: '数据',
      dataIndex: 'dataContent',
      key: 'dataContent',
      width: 180,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '值类型',
      dataIndex: 'valueType',
      key: 'valueType',
      align: 'center',
      ellipsis: true,
    },
    // {
    //   title: '备注',
    //   dataIndex: 'remark',
    //   key: 'remark',
    //   align: 'center',
    //   ellipsis: true,
    // },
    {
      title: '是否缺失',
      dataIndex: 'isMissing',
      key: 'isMissing',
      align: 'center',
      ellipsis: true,
    },
  ]
)
// 运动学参数数据
const kinematics_datasource = computed(() => {
  if (!props.datasource || props.datasource.length === 0 || !props.datasource[0]) return [];

  const item = props.datasource[0] || {};
  // 支持嵌套数据结构：如果数据在 "飞行仿真" 键下，需要先提取
  let dataSource = item
  if (item['飞行仿真']) {
    dataSource = { ...item, ...item['飞行仿真'] }
  }
  const arr1 = dataSource["运动学模型、气动参数模型"] || [];
  const arr2 = dataSource["运动学模型"] || [];

  // 合并并保留响应式
  return [...arr1, ...arr2];
})
// 表格的单元
const columns_engine = ref(
  [
    // {
    //   title: '序号',
    //   dataIndex: 'serialNumber',
    //   key: 'serialNumber',
    //   align: 'center',
    //   ellipsis: true,
    // },
    // {
    //   title: '数据类型',
    //   dataIndex: 'dataType',
    //   key: 'dataType',
    //   width: 180,
    //   align: 'center',
    //   ellipsis: true,
    // },
    {
      title: '数据',
      dataIndex: 'dataContent',
      key: 'dataContent',
      width: 180,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '值类型',
      dataIndex: 'valueType',
      key: 'valueType',
      align: 'center',
      ellipsis: true,
    },
    // {
    //   title: '备注',
    //   dataIndex: 'remark',
    //   key: 'remark',
    //   align: 'center',
    //   ellipsis: true,
    // },
    {
      title: '是否缺失',
      dataIndex: 'isMissing',
      key: 'isMissing',
      align: 'center',
      ellipsis: true,
    },
  ]
)
// 运动学参数数据
const engine_datasource = computed(() => {
  if (props.datasource && props.datasource.length > 0 && props.datasource[0]) {
    const item = props.datasource[0]
    // 支持嵌套数据结构：如果数据在 "飞行仿真" 键下，需要先提取
    let dataSource = item
    if (item['飞行仿真']) {
      dataSource = { ...item, ...item['飞行仿真'] }
    }
    return dataSource["发动机模型"] || []
  }
  return []
})

const columns_flight_control = ref(
  [
    // {
    //   title: '序号',
    //   dataIndex: 'serialNumber',
    //   key: 'serialNumber',
    //   align: 'center',
    //   ellipsis: true,
    // },
    // {
    //   title: '数据类型',
    //   dataIndex: 'dataType',
    //   key: 'dataType',
    //   width: 180,
    //   align: 'center',
    //   ellipsis: true,
    // },
    {
      title: '数据',
      dataIndex: 'dataContent',
      key: 'dataContent',
      width: 180,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '值类型',
      dataIndex: 'valueType',
      key: 'valueType',
      align: 'center',
      ellipsis: true,
    },
    // {
    //   title: '备注',
    //   dataIndex: 'remark',
    //   key: 'remark',
    //   align: 'center',
    //   ellipsis: true,
    // },
    {
      title: '是否缺失',
      dataIndex: 'isMissing',
      key: 'isMissing',
      align: 'center',
      ellipsis: true,
    },
  ]
)

const flight_control_datasource = computed(() => {
  if (props.datasource && props.datasource.length > 0 && props.datasource[0]) {
    const item = props.datasource[0]
    // 支持嵌套数据结构：如果数据在 "飞行仿真" 键下，需要先提取
    let dataSource = item
    if (item['飞行仿真']) {
      dataSource = { ...item, ...item['飞行仿真'] }
    }
    return dataSource["飞控模型"] || []
  }
  return []
})

// ================= 武器系统右侧表格配置（复用 weapons-system.vue 逻辑） =================
const columns_missile = ref(
  [
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 180,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '数据',
      dataIndex: 'dataContent',
      key: 'dataContent',
      width: 180,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '值类型',
      dataIndex: 'valueType',
      key: 'valueType',
      align: 'center',
      ellipsis: true,
    },
    // {
    //   title: '备注',
    //   dataIndex: 'remark',
    //   key: 'remark',
    //   align: 'center',
    //   ellipsis: true,
    // },
    {
      title: '是否缺失',
      dataIndex: 'isMissing',
      key: 'isMissing',
      align: 'center',
      ellipsis: true,
    },
  ]
)
const missile_datasource = computed(() => {
  if (!props.datasource || props.datasource.length === 0 || !props.datasource[0]) return []
  const item = props.datasource[0]
  // 支持嵌套数据结构：如果数据在 "武器系统" 键下，需要先提取
  let dataSource = item
  if (item['武器系统']) {
    dataSource = { ...item, ...item['武器系统'] }
  }
  return dataSource['导弹模型'] ?? []
})

const columns_gun = ref(
  [
    {
      title: '数据',
      dataIndex: 'dataContent',
      key: 'dataContent',
      width: 180,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '值类型',
      dataIndex: 'valueType',
      key: 'valueType',
      align: 'center',
      ellipsis: true,
    },
    // {
    //   title: '备注',
    //   dataIndex: 'remark',
    //   key: 'remark',
    //   align: 'center',
    //   ellipsis: true,
    // },
    {
      title: '是否缺失',
      dataIndex: 'isMissing',
      key: 'isMissing',
      align: 'center',
      ellipsis: true,
    },
  ]
)
const gun_datasource = computed(() => {
  if (!props.datasource || props.datasource.length === 0 || !props.datasource[0]) return []
  const item = props.datasource[0]
  // 支持嵌套数据结构：如果数据在 "武器系统" 键下，需要先提取
  let dataSource = item
  if (item['武器系统']) {
    dataSource = { ...item, ...item['武器系统'] }
  }
  return dataSource['航炮模型'] ?? []
})

const columns_arms_control = ref(
  [
    {
      title: '数据',
      dataIndex: 'dataContent',
      key: 'dataContent',
      width: 180,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '值类型',
      dataIndex: 'valueType',
      key: 'valueType',
      align: 'center',
      ellipsis: true,
    },
    // {
    //   title: '备注',
    //   dataIndex: 'remark',
    //   key: 'remark',
    //   align: 'center',
    //   ellipsis: true,
    // },
    {
      title: '是否缺失',
      dataIndex: 'isMissing',
      key: 'isMissing',
      align: 'center',
      ellipsis: true,
    },
  ]
)
const arms_control_datasource = computed(() => {
  if (!props.datasource || props.datasource.length === 0 || !props.datasource[0]) return []
  const item = props.datasource[0]
  // 支持嵌套数据结构：如果数据在 "武器系统" 键下，需要先提取
  let dataSource = item
  if (item['武器系统']) {
    dataSource = { ...item, ...item['武器系统'] }
  }
  return dataSource['武器接口'] ?? dataSource['武器控制模型'] ?? []
})

const columns_fire_control_radar = ref(
  [
    {
      title: '数据',
      dataIndex: 'dataContent',
      key: 'dataContent',
      width: 180,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '值类型',
      dataIndex: 'valueType',
      key: 'valueType',
      align: 'center',
      ellipsis: true,
    },
    // {
    //   title: '备注',
    //   dataIndex: 'remark',
    //   key: 'remark',
    //   align: 'center',
    //   ellipsis: true,
    // },
    {
      title: '是否缺失',
      dataIndex: 'isMissing',
      key: 'isMissing',
      align: 'center',
      ellipsis: true,
    },
  ]
)
const fire_control_radar_datasource = computed(() => {
  if (!props.datasource || props.datasource.length === 0 || !props.datasource[0]) return []
  const item = props.datasource[0]
  // 支持嵌套数据结构：如果数据在 "武器系统" 键下，需要先提取
  let dataSource = item
  if (item['武器系统']) {
    dataSource = { ...item, ...item['武器系统'] }
  }
  return dataSource['火控雷达模型'] ?? []
})
const missList = [
  {
    missingInterface: "本机纬度",
    missingList: []
  }
]

// 场景切换：飞行仿真 / 武器系统
const scenarioType = ref('飞行仿真')
const handleScenarioChange = (value: string) => {
  // scenarioType.value = value
}

// 透传事件给父级（用于武器系统子组件）
const emitUpload = (payload: any) => emit('update:upload', payload)
const emitDelete = (payload: any) => emit('update:deleteData', payload)
const emitDownload = (payload: any) => emit('update:downloadTemplate', payload)
const emitEvaluate = (payload: any) => emit('update:evaluate', payload)
// 下载模版
const handleDownloadTemplate = (value: any) => {
  emit('update:downloadTemplate', value)
}
// 加载数据
const handleLoadData = () => {
  emit('update:loadData', { scene: scenarioType.value })
}
// 按场景拆分评估参数，确保各传各的
const pickDatasourceByScene = (scene: '飞行仿真' | '武器系统') => {
  if (!props.datasource || props.datasource.length === 0) return null
  const source = props.datasource[0] || {}

  // 支持新的数据结构：如果数据在 "飞行仿真" 或 "武器系统" 键下，需要先提取
  let dataSource = source
  if (source['飞行仿真']) {
    dataSource = { ...source, ...source['飞行仿真'] }
  }
  if (source['武器系统']) {
    dataSource = { ...dataSource, ...source['武器系统'] }
  }

  const flightKeys = ['气动参数', '运动学模型、气动参数模型', '运动学模型', '发动机模型', '飞控模型']
  const weaponKeys = ['导弹模型', '航炮模型', '武器控制模型', '火控雷达模型']
  const targetKeys = scene === '武器系统' ? weaponKeys : flightKeys

  const filtered: Record<string, any> = {}
  targetKeys.forEach((k) => {
    if (dataSource[k]) filtered[k] = dataSource[k]
  })

  return Object.keys(filtered).length ? [filtered] : null
}

// 评估数据：一次点击，向父级发送两场景的独立参数，父级自行发两次请求
const handleEvaluateData = () => {
  const flightDs = pickDatasourceByScene('飞行仿真')
  const weaponDs = pickDatasourceByScene('武器系统')

  if (!flightDs && !weaponDs) {
    return message.info('暂无数据，无法评分')
  }

  emit('update:evaluate', {
    flight: flightDs,
    weapon: weaponDs,
  })
}

// 计算进度条（总得分）
const circleRadius = 44; // 圆的半径
const circleCircumference = 2 * Math.PI * circleRadius; // 圆的周长 ≈ 276.48

const calcDashArray = (scoreVal: number) => {
  const val = Number(scoreVal) || 0
  if (!val) return `0 ${circleCircumference}`
  const percentage = Math.min(Math.max(val, 0), 100) / 100
  const progressLength = circleCircumference * percentage
  const remainingLength = circleCircumference - progressLength
  return `${progressLength} ${remainingLength}`
}

const totalScoreVal = computed(() => {
  const es: any = props.evaluateScore || {}
  
  // 获取飞行仿真的得分和权值
  const flightScore = Number(es?.flight?.evaluateTreeScore?.score || es?.flight?.score || 0)
  const flightWeight = Number(es?.flight?.evaluateTreeScore?.weight || es?.flight?.weight || 0)
  
  // 获取武器系统的得分和权值
  const weaponScore = Number(es?.weapon?.evaluateTreeScore?.score || es?.weapon?.score || 0)
  const weaponWeight = Number(es?.weapon?.evaluateTreeScore?.weight || es?.weapon?.weight || 0)
  
  // 总得分 = 飞行仿真的得分 * 权值 + 武器系统的得分 * 权值
  const total = flightScore * flightWeight + weaponScore * weaponWeight
  
  // 修复浮点数精度问题，保留1位小数
  return Math.round(total * 10) / 10
})

const totalDashArray = computed(() => calcDashArray(totalScoreVal.value))

// 评估结果表头（仿性能准确度左侧表格样式）
const scoreColumns = computed(() => [
  {
    title: '评估要素',
    dataIndex: 'dimension',
    key: 'dimension',
    align: 'center',
    width: '35%',
  },
  {
    title: '得分',
    dataIndex: 'score',
    key: 'score',
    align: 'center',
    width: '15%',
  },
  {
    title: '权值',
    dataIndex: 'weight',
    key: 'weight',
    align: 'center',
    width: '15%',
  },
  {
    title: '失分原因',
    dataIndex: 'reason',
    key: 'reason',
    align: 'center',
    width: '35%',
  },
]);

// 评估结果表格数据（根据 evaluateScore 结构：{ flight: { evaluateTreeScore }, weapon: { evaluateTreeScore } }）
// 展示顺序：第一父项“飞行仿真”，第二父项“武器系统”；子项来自 evaluateTreeScoresList
const scoreTableData = computed(() => {
  const es: any = props.evaluateScore || {}
  const result: any[] = []

  const pushScene = (sceneName: string, sceneData: any) => {
    if (!sceneData) return

    // 兼容数据结构：优先取 evaluateTreeScore
    const sceneScore = sceneData.evaluateTreeScore || sceneData

    // 父项（场景）
    result.push({
      dimension: sceneName,
      score: sceneScore.score ?? 0,
      weight: sceneScore.weight ?? 0,
      reason: sceneScore.reason || '',
      isParent: true,
    })

    // 子项（模型/维度列表）
    const children = sceneScore.evaluateTreeScoresList || []
    if (Array.isArray(children) && children.length > 0) {
      children.forEach((child: any) => {
        result.push({
          dimension: child?.scoreType ?? '',
          score: child?.score ?? 0,
          weight: child?.weight ?? 0,
          reason: child?.reason || '无扣分',
          isParent: false,
        })
      })
    }
  }

  pushScene('飞行仿真', es.flight)
  pushScene('武器系统', es.weapon)

  // 兜底：如果没有聚合结构，按原有单场景展示
  if (!es.flight && !es.weapon) pushScene('', es)

  return result
});
</script>

<template>
    <div class="w-full h-full flex flex-col gap-5">
     <div class="w-full flex gap-5 items-stretch" style="height: calc(100vh - 140px);">
        <Card class="p-6 w-[60%] flex flex-col gap-6 h-full overflow-hidden">
        <!-- 空状态 -->
        <a-empty class="flex-center flex-col flex-1" v-if="!evaluateScore" :image="Empty"
          :image-style="{ height: '100px' }">
        <template #description>
            <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              暂无评估结果数据，请选择右侧数据点击评估，对模型性能参数数据进行评估。
              <ArrowRightOutlined class="text-blue-500" />
          </div>
        </template>
      </a-empty>

        <!-- 有数据时的显示 -->
         <div v-if="evaluateScore" class="flex flex-col gap-6 flex-1 min-h-0 overflow-y-auto">
          <!-- 总得分单圆圈 -->
          <div class="flex justify-center items-center py-4">
            <div class="relative w-64 h-64">
            <div class="absolute inset-0 rounded-full">
              <svg class="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#f0f2f5" stroke-width="8"
                    class="dark:stroke-[#1e293b]" />
                  <circle v-if="totalScoreVal > 0" cx="50" cy="50" r="44" fill="none"
                    stroke="url(#scoreGradientTotal)" stroke-width="8" stroke-linecap="round"
                    :stroke-dasharray="totalDashArray" transform="rotate(-90 50 50)"
                    class="transition-all duration-1000 ease-out" />
                <defs>
                    <linearGradient id="scoreGradientTotal">
                      <stop offset="0%" stop-color="#3b82f6" />
                      <stop offset="100%" stop-color="#1d4ed8" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
              <div class="absolute inset-0 flex flex-col items-center justify-center z-10">
                <div class="text-7xl font-bold text-gray-900 dark:text-white leading-none mb-5 tracking-tight">
                  {{ totalScoreVal }}
                </div>
                <div class="text-lg text-gray-600 dark:text-gray-400 font-medium">
                  总得分
              </div>
              </div>
            </div>
          </div>
          <!-- 评估结果明细表 -->
          <div class="w-full flex justify-center" v-if="evaluateScore">
            <div class="w-full max-w-4xl">
              <a-table :columns="scoreColumns" :data-source="scoreTableData" :pagination="false"
                :row-class-name="(record) => record.isParent ? 'parent-row' : 'child-row'" bordered size="middle"
                class="rounded-lg overflow-hidden">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'dimension'">
                    <div :class="[
                      'flex items-center',
                      record.isParent ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 pl-6'
                    ]">
                      <span v-if="!record.isParent" class="mr-2 text-gray-400">└─</span>
                      <span>{{ record.dimension }}</span>
                    </div>
                  </template>
                  <template v-else-if="column.key === 'score'">
                    <span :class="[
                      record.isParent ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-700 dark:text-gray-300'
                    ]">
                      {{ record.score }}
                    </span>
                  </template>
                  <template v-else-if="column.key === 'weight'">
                    <span :class="[
                      record.isParent ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-700 dark:text-gray-300'
                    ]">
                      {{ record.weight }}
                    </span>
                  </template>
                  <template v-else-if="column.key === 'reason'">
                    <span v-if="record.isParent" class="text-gray-400 dark:text-gray-500">
                      -
                    </span>
                    <span v-else class="text-gray-600 dark:text-gray-400">
                      {{ record.reason && record.reason.trim() ? record.reason : '无扣分' }}
                    </span>
                  </template>
                </template>
              </a-table>
          </div>
        </div>

          <!-- 接口参数缺省项和失分原因 -->
          <div class="flex items-start w-full gap-4" v-if="false">
          <div class="w-1/2">
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                <div class="text-[16px] font-bold dark:text-white mb-3 flex items-center gap-2">
                  <ExclamationOutlined class="text-orange-500" />
                  接口参数缺省项
                </div>
                <div v-if="!evaluateScore.missingInterface || evaluateScore.missingInterface.length === 0"
                  class="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                  <ExclamationOutlined class="text-4xl mb-2 opacity-50" />
                  <div class="text-sm">暂无数据</div>
                </div>
                <a-list v-else size="small" :data-source="evaluateScore.missingInterface" class="bg-transparent">
              <template #renderItem="{ item }">
                <!-- 每个 item 是 { 维度名: [字段...] } -->
                    <a-list-item class="!px-0 !py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <!-- 维度标题 -->
                      <div class="font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    {{ Object.keys(item)[0] }}
                  </div>
                  <!-- 缺失字段小列表 -->
                      <div v-if="item[Object.keys(item)[0]] && item[Object.keys(item)[0]].length > 0" class="pl-4">
                        <a-list size="small" :data-source="item[Object.keys(item)[0]]" class="bg-transparent">
                    <template #renderItem="{ item: field }">
                            <a-list-item class="!px-0 !py-1 text-gray-600 dark:text-gray-300">
                              <span class="text-orange-500 mr-2">•</span>
                        {{ field }}
                      </a-list-item>
                    </template>
                  </a-list>
                      </div>
                </a-list-item>
              </template>
            </a-list>
              </div>
          </div>
          <div class="w-1/2">
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                <div class="text-[16px] font-bold dark:text-white mb-3 flex items-center gap-2">
                  <ExclamationOutlined class="text-red-500" />
                  失分原因
                </div>
                <div v-if="!evaluateScore.reason || evaluateScore.reason.length === 0"
                  class="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                  <ExclamationOutlined class="text-4xl mb-2 opacity-50" />
                  <div class="text-sm">暂无数据</div>
                </div>
                <a-list v-else size="small" :data-source="evaluateScore.reason.split('；')" class="bg-transparent">
                  <template #renderItem="{ item }">
                    <a-list-item class="!px-0 !py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      <span class="text-red-500 mr-2">•</span>
                      <span class="text-gray-700 dark:text-gray-300">{{ item }}</span>
                    </a-list-item>
              </template>
            </a-list>
              </div>
          </div>
        </div>
      </div>
    </Card>
      <Card class="h-full w-[40%] flex flex-col overflow-hidden">
        <CardContent class="flex flex-col gap-0 flex-1 min-h-0 overflow-hidden">
          <!-- 顶部切换 -->
          <div class="flex flex-col pt-4 pb-4 gap-3 border-b border-gray-200 dark:border-gray-700">
            <div class="w-full flex justify-between items-center gap-3">
              <a-radio-group v-model:value="scenarioType" button-style="solid" @change="handleScenarioChange">
                <a-radio-button value="飞行仿真">飞行仿真</a-radio-button>
                <a-radio-button value="武器系统">武器系统</a-radio-button>
              </a-radio-group>
              <div class="flex items-center gap-2">
                <a-button type="default" :icon="h(DatabaseOutlined)" @click="handleLoadData" class="flex-shrink-0">
                  加载数据
                </a-button>
                <a-button type="primary" :icon="h(SendOutlined)" @click="handleEvaluateData" class="flex-shrink-0">
                  评估
                </a-button>
              </div>
            </div>
          </div>

          <!-- 右侧内容：根据场景切换 -->
          <template v-if="scenarioType === '飞行仿真'">
            <!-- 顶部操作区域（飞行仿真） -->
            <!-- <div class="flex flex-col pt-4 pb-4 gap-3 border-b border-gray-200 dark:border-gray-700">
              <div class="flex justify-between items-center gap-3">
                <div class="flex items-center gap-2">
                  <a-button type="default" :icon="h(DatabaseOutlined)" @click="handleLoadData" class="flex-shrink-0">
                    加载数据
                  </a-button>
                  <a-button type="primary" :icon="h(SendOutlined)" @click="handleEvaluateData" class="flex-shrink-0">
                    评估
                  </a-button>
                </div>
              </div>
            </div> -->
            <!-- 操作区域 -->
            <div class="flex flex-col pt-4 pb-4 gap-3">
              <div class="w-full flex items-center justify-start gap-2 flex-wrap">
              <a-popover v-model:open="afSim_visible" trigger="click" placement="bottom">
                <template #content>
                    <div class="flex flex-col">
                      <a-upload-dragger :file-list="fileList" name="file" @change="onUploadChange" @remove="onRemove"
                        :before-upload="beforeUpload">
                    <p class="ant-upload-drag-icon">
                          <InboxOutlined />
                    </p>
                    <p class="ant-upload-text">点击或拖拽文件到该区域进行文件上传</p>
                    <p class="ant-upload-hint">
                      支持单个或批量上传。严禁上传公司数据或其他受限制的文件。
                    </p>
                  </a-upload-dragger>
                      <a-button @click="onSubmit('TX')" class="mt-3 w-full" :loading="uploading"
                            :disabled="fileList?.length === 0">
                    {{ uploading ? '上传中' : '开始上传' }}
                  </a-button>
                    </div>
                </template>
                  <a-button type="primary" :icon="h(UploadOutlined)"
                    class="flex-shrink-0 whitespace-nowrap">上传AfSim数据</a-button>
              </a-popover>
              <a-popover v-model:open="visible" trigger="click" placement="bottom">
                <template #content>
                    <div class="flex flex-col">
                      <a-upload-dragger :file-list="fileList" name="file" @change="onUploadChange" @remove="onRemove"
                        :before-upload="beforeUpload">
                    <p class="ant-upload-drag-icon">
                          <InboxOutlined />
                    </p>
                    <p class="ant-upload-text">点击或拖拽文件到该区域进行文件上传</p>
                    <p class="ant-upload-hint">
                      支持单个或批量上传。严禁上传公司数据或其他受限制的文件。
                    </p>
                  </a-upload-dragger>
                      <a-button @click="onSubmit('ZN')" class="mt-3 w-full" :loading="uploading"
                            :disabled="fileList?.length === 0">
                    {{ uploading ? '上传中' : '开始上传' }}
                  </a-button>
                    </div>
                </template>
                  <a-button type="primary" :icon="h(UploadOutlined)"
                    class="flex-shrink-0 whitespace-nowrap">上传数据</a-button>
              </a-popover>
                <a-button type="link" :icon="h(DownloadOutlined)" size="small"
                  @click="handleDownloadTemplate('飞行仿真.xlsx')"
                  class="flex-shrink-0 whitespace-nowrap text-blue-500 hover:text-blue-600">
                  下载Excel模版
                </a-button>
              </div>
            </div>
            <div class="w-full flex-1 min-h-0 overflow-y-auto">
              <div class="space-y-4">
                <div>
                  <a-divider orientation="left" class="!mb-3">
                    <span class="text-base font-semibold">气动参数模型</span>
                  </a-divider>
                  <a-table :columns="columns_aerodynamic_parameter" :data-source="aerodynamic_parameter_datasource"
                    bordered size="small" :pagination="false" class="rounded-lg overflow-hidden">
                  </a-table>
                </div>
                <div>
                  <a-divider orientation="left" class="!mb-3">
                    <span class="text-base font-semibold">运动学模型</span>
                  </a-divider>
                  <a-table :columns="columns_kinematics" :data-source="kinematics_datasource" bordered size="small"
                    :pagination="false" class="rounded-lg overflow-hidden">
                  </a-table>
                </div>
                <div>
                  <a-divider orientation="left" class="!mb-3">
                    <span class="text-base font-semibold">发动机模型</span>
                  </a-divider>
                  <a-table :columns="columns_engine" :data-source="engine_datasource" bordered size="small"
                    :pagination="false" class="rounded-lg overflow-hidden">
                  </a-table>
                </div>
                <div>
                  <a-divider orientation="left" class="!mb-3">
                    <span class="text-base font-semibold">飞控模型</span>
                  </a-divider>
                  <a-table :columns="columns_flight_control" :data-source="flight_control_datasource" bordered
                    size="small" :pagination="false" class="rounded-lg overflow-hidden">
                  </a-table>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <!-- 顶部操作区域（武器系统，同武器系统页） -->
            <!-- <div class="flex flex-col pt-4 pb-4 gap-3 border-b border-gray-200 dark:border-gray-700">
              <div class="flex justify-between items-center gap-3">
                <div class="flex items-center gap-2">
                  <a-button type="default" :icon="h(DatabaseOutlined)" @click="handleLoadData" class="flex-shrink-0">
                加载数据
              </a-button>
                  <a-button type="primary" :icon="h(SendOutlined)" @click="handleEvaluateData" class="flex-shrink-0">
                    评估
                  </a-button>
                </div>
              </div>
            </div> -->
            <!-- 操作区域 -->
            <div class="flex flex-col pt-4 pb-4 gap-3">
              <div class="w-full flex items-center justify-start gap-2 flex-wrap">
                <a-popover v-model:open="afSim_visible" trigger="click" placement="bottom">
                  <template #content>
                    <div class="flex flex-col">
                      <a-upload-dragger :file-list="fileList" name="file" @change="onUploadChange" @remove="onRemove"
                        :before-upload="beforeUpload">
                        <p class="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p class="ant-upload-text">点击或拖拽文件到该区域进行文件上传</p>
                        <p class="ant-upload-hint">
                          支持单个或批量上传。严禁上传公司数据或其他受限制的文件。
                        </p>
                      </a-upload-dragger>
                      <a-button @click="onSubmit('TX')" class="mt-3 w-full" :loading="uploading"
                        :disabled="fileList?.length === 0">
                        {{ uploading ? '上传中' : '开始上传' }}
                      </a-button>
                    </div>
                  </template>
                  <a-button type="primary" :icon="h(UploadOutlined)"
                    class="flex-shrink-0 whitespace-nowrap">上传AfSim数据</a-button>
                </a-popover>
                <a-popover v-model:open="visible" trigger="click" placement="bottom">
                  <template #content>
                    <div class="flex flex-col">
                      <a-upload-dragger :file-list="fileList" name="file" @change="onUploadChange" @remove="onRemove"
                        :before-upload="beforeUpload">
                        <p class="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p class="ant-upload-text">点击或拖拽文件到该区域进行文件上传</p>
                        <p class="ant-upload-hint">
                          支持单个或批量上传。严禁上传公司数据或其他受限制的文件。
                        </p>
                      </a-upload-dragger>
                      <a-button @click="onSubmit('ZN')" class="mt-3 w-full" :loading="uploading"
                        :disabled="fileList?.length === 0">
                        {{ uploading ? '上传中' : '开始上传' }}
                      </a-button>
                    </div>
                  </template>
                  <a-button type="primary" :icon="h(UploadOutlined)"
                    class="flex-shrink-0 whitespace-nowrap">上传数据</a-button>
                </a-popover>
                <a-button type="link" :icon="h(DownloadOutlined)" size="small"
                  @click="handleDownloadTemplate('武器系统.xlsx')"
                  class="flex-shrink-0 whitespace-nowrap text-blue-500 hover:text-blue-600">
                下载Excel模版
              </a-button>
              </div>
        </div>
            <div class="w-full flex-1 min-h-0 overflow-y-auto">
              <div class="space-y-4">
                <div>
                  <a-divider orientation="left" class="!mb-3">
                    <span class="text-base font-semibold">导弹模型</span>
                  </a-divider>
                  <a-table :columns="columns_missile" :data-source="missile_datasource" bordered size="small"
                    :pagination="false" class="rounded-lg overflow-hidden">
          </a-table>
                </div>
                <div>
                  <a-divider orientation="left" class="!mb-3">
                    <span class="text-base font-semibold">航炮模型</span>
                  </a-divider>
                  <a-table :columns="columns_gun" :data-source="gun_datasource" bordered size="small"
                    :pagination="false" class="rounded-lg overflow-hidden">
          </a-table>
                </div>
                <div>
                  <a-divider orientation="left" class="!mb-3">
                    <span class="text-base font-semibold">武器控制模型</span>
                  </a-divider>
                  <a-table :columns="columns_arms_control" :data-source="arms_control_datasource" bordered size="small"
                    :pagination="false" class="rounded-lg overflow-hidden">
          </a-table>
                </div>
                <div>
                  <a-divider orientation="left" class="!mb-3">
                    <span class="text-base font-semibold">火控雷达模型</span>
                  </a-divider>
                  <a-table :columns="columns_fire_control_radar" :data-source="fire_control_radar_datasource" bordered
                    size="small" :pagination="false" class="rounded-lg overflow-hidden">
          </a-table>
        </div>
              </div>
            </div>
          </template>
      </CardContent>
    </Card>
    </div>
  </div>

</template>

<style scoped>
/* Vue 3 使用 :deep() 语法 */
:deep(.ant-table-thead > tr > th) {
  text-align: center !important;
}

/* 确保表头单元格内容居中 */
:deep(.ant-table-thead > tr > th > .ant-table-cell) {
  text-align: center !important;
}

/* 优化列表样式 */
:deep(.ant-list-item) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

:deep(.ant-list-item:last-child) {
  border-bottom: none;
}

/* 优化表格样式 */
:deep(.ant-table) {
  border-radius: 8px;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}

.dark :deep(.ant-table-thead > tr > th) {
  background-color: #1f2937;
}

/* 优化滚动条样式 */
:deep(.ant-list) {
  max-height: none;
}
</style>
