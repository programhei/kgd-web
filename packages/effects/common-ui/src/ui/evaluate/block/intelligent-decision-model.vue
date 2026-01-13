<script setup lang="ts">
import {h, computed, ref, reactive, watch} from 'vue'
import {
  DatabaseOutlined,
  DownloadOutlined,
  InboxOutlined,
  UploadOutlined,
  ExclamationOutlined,
  QuestionOutlined,
  DownOutlined
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
import './index.css'
import original from '../../../assets/images/original.png'
import {useUpload} from '../../../hook/useUpload'
import {message} from "ant-design-vue";

const props = defineProps({
  datasource: [],
  evaluateScore: null,
  intelligentData: {
    type: Array,
    default: () => []
  },
  intelligentDecisionData: {
    type: Array,
    default: () => []
  }
})

// 兼容当前评分数据（含 evaluateTreeScore）
const evaluateScoreItem = computed(() => {
  if (!props.evaluateScore) return null
  if ((props.evaluateScore as any).evaluateTreeScore) return (props.evaluateScore as any)
  // 如果外层直接是数组，取第一项
  if (Array.isArray(props.evaluateScore)) return props.evaluateScore[0] || null
  return props.evaluateScore
})

// 评估树根节点
const evaluateTreeRoot = computed(() => evaluateScoreItem.value?.evaluateTreeScore || null)
// 传递事件
const emit = defineEmits<{
  'update:upload': [value: any],
  'update:loadData': [],
  'update:loadIntelligent': [],
  'update:loadIntelligentDecision': [],
  'update:deleteData': [value: any],
  'update:downloadTemplate': [value: any],
  'update:evaluate': [value: any],
}>()

// 上传
const {fileList, uploading, beforeUpload, onRemove, onUploadChange, onSubmit} = useUpload((fd, extra) => {
  emit('update:upload', {fd, extra})
})
const Empty = ref(original)
// 权值设定模态框打开状态
const opened = ref(false)
// 上传数据记录
const visible = ref(false)
// 上传znn数据记录
const zne_visible = ref(false)
// 权值数据
const weightData = computed(() => {
  return []
})
// 表格的单元
const columns = ref(
  [
    {
      title: '序号',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      align: 'center',
      ellipsis: true,
    },
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
    {
      title: '重要等级',
      dataIndex: 'importanceLevel',
      key: 'importanceLevel',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '是否缺失',
      dataIndex: 'isMissing',
      key: 'isMissing',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '格式是否正确',
      dataIndex: 'isFormatCorrect',
      key: 'isFormatCorrect',
      align: 'center',
      ellipsis: true,
    },
  ]
)

// 下载模版
const handleDownloadTemplate = (value: any) => {
  emit('update:downloadTemplate', value)
}
// 加载数据
const handleLoadData = () => {
  emit('update:loadData')
}
// 加载智能决策数据
const handleLoadIntelligent = () => {
  emit('update:loadIntelligent')
}
// 加载智能决策（单条接口）
const handleLoadIntelligentDecision = () => {
  emit('update:loadIntelligentDecision')
}
// 同时加载多条和单条数据
const handleLoadAllData = () => {
  handleLoadIntelligent()
  handleLoadIntelligentDecision()
}
//  评估数据
const handleEvaluateData = () => {
  // if (!props.datasource || props.datasource.length === 0) {
  //   return message.info('暂无数据，无法评分')
  // }
  emit('update:evaluate', [])
}

// 计算进度条
const circleRadius = 44; // 圆的半径
const circleCircumference = 2 * Math.PI * circleRadius; // 圆的周长 ≈ 276.48

// 计算进度条的 stroke-dasharray
const progressDashArray = computed(() => {
  const score = Number(evaluateScoreItem.value?.score || 0)
  if (!score) {
    return `0 ${circleCircumference}`;
  }
  const percentage = Math.min(Math.max(score, 0), 100) / 100;
  const progressLength = circleCircumference * percentage;
  const remainingLength = circleCircumference - progressLength;
  return `${progressLength} ${remainingLength}`;
});

// 获取当前得分（直接显示接口返回的值）
const currentScore = computed(() => Number(evaluateScoreItem.value?.score ?? 0));

// 表格列定义
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

// 智能决策数据列
const intelligentColumns = [
  { title: '地形创建', dataIndex: 'createTerrain', key: 'createTerrain', align: 'center' },
  { title: '视角设计', dataIndex: 'perspectiveDesign', key: 'perspectiveDesign', align: 'center' },
  { title: '飞行轨迹视景显示', dataIndex: 'flightTrajectoryVisualization', key: 'flightTrajectoryVisualization', align: 'center' },
  { title: '飞行姿态显示', dataIndex: 'flightAttitude', key: 'flightAttitude', align: 'center' },
  { title: '仿真对抗胜负评估', dataIndex: 'winLossEvaluation', key: 'winLossEvaluation', align: 'center' },
  { title: '仿真对抗效能评估', dataIndex: 'effectivenessEvaluation', key: 'effectivenessEvaluation', align: 'center' },
]

// 计算数据类型列的 rowSpan（用于表格模板）
const getDataTypeRowSpanForTable = (dataSource: any[], index: number) => {
  if (!dataSource || dataSource.length === 0 || index < 0 || index >= dataSource.length) {
    return 1
  }
  
  const currentType = dataSource[index]?.dataType || ''
  if (!currentType) {
    return 1
  }
  
  // 如果是第一行，或者上一行的数据类型不同，则开始计算
  if (index === 0 || dataSource[index - 1]?.dataType !== currentType) {
    // 计算相同数据类型的连续行数
    let count = 1
    for (let i = index + 1; i < dataSource.length; i++) {
      if (dataSource[i]?.dataType === currentType) {
        count++
      } else {
        break
      }
    }
    return count
  }
  
  // 否则返回 0，表示该单元格被合并，不显示
  return 0
}

// 按数据类型分组数据
const groupDataByType = (dataSource: any[]) => {
  if (!dataSource || dataSource.length === 0) {
    return []
  }
  
  const groups: Record<string, any[]> = {}
  
  dataSource.forEach((item) => {
    const type = item.dataType || '未分类'
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(item)
  })
  
  return Object.keys(groups).map((type) => ({
    type,
    data: groups[type],
    count: groups[type].length
  }))
}

// 为每个 tab 的数据计算 rowSpan 信息
const getTabRowSpanMap = (dataSource: any[]) => {
  if (!dataSource || dataSource.length === 0) {
    return {}
  }
  
  const rowSpanMap: Record<number, number> = {}
  let currentType = ''
  let startIndex = 0
  
  // 初始化第一行
  if (dataSource.length > 0) {
    currentType = dataSource[0]?.dataType || ''
    startIndex = 0
  }
  
  for (let index = 1; index < dataSource.length; index++) {
    const type = dataSource[index]?.dataType || ''
    if (type !== currentType) {
      // 新的数据类型开始，处理上一组
      const span = index - startIndex
      rowSpanMap[startIndex] = span
      // 其他行设置为 0（隐藏）
      for (let i = startIndex + 1; i < index; i++) {
        rowSpanMap[i] = 0
      }
      // 开始新的一组
      currentType = type
      startIndex = index
    }
  }
  
  // 处理最后一组
  if (dataSource.length > 0) {
    const span = dataSource.length - startIndex
    rowSpanMap[startIndex] = span
    for (let i = startIndex + 1; i < dataSource.length; i++) {
      rowSpanMap[i] = 0
    }
  }
  
  return rowSpanMap
}

// 生成带有 rowSpan 的列配置
const getColumnsWithRowSpan = (dataSource: any[]) => {
  const rowSpanMap = getTabRowSpanMap(dataSource)
  
  return [
    { 
      title: '数据类型', 
      dataIndex: 'dataType', 
      key: 'dataType', 
      align: 'center', 
      width: 140,
      customCell: (record: any, rowIndex: number) => {
        const rowSpan = rowSpanMap[rowIndex] !== undefined ? rowSpanMap[rowIndex] : 1
        return {
          rowSpan: rowSpan,
          colSpan: 1
        }
      }
    },
    { title: '数据内容', dataIndex: 'dataContent', key: 'dataContent', align: 'center', width: 160 },
    { title: '值类型', dataIndex: 'valueType', key: 'valueType', align: 'center', width: 90 },
    { title: '重要等级', dataIndex: 'importanceLevel', key: 'importanceLevel', align: 'center', width: 90 },
    { title: '数据类别', dataIndex: 'dataKind', key: 'dataKind', align: 'center', width: 180 },
    { title: '是否缺失', dataIndex: 'isMissing', key: 'isMissing', align: 'center', width: 90 },
    { title: '接口类型', dataIndex: 'interfaceType', key: 'interfaceType', align: 'center', width: 140 },
  ]
}

// 单条智能决策列（接口字段展示）
const intelligentDecisionColumns = computed(() => [
  { 
    title: '数据类型', 
    dataIndex: 'dataType', 
    key: 'dataType', 
    align: 'center', 
    width: 140
  },
  { title: '数据内容', dataIndex: 'dataContent', key: 'dataContent', align: 'center', width: 160 },
  { title: '值类型', dataIndex: 'valueType', key: 'valueType', align: 'center', width: 90 },
  { title: '重要等级', dataIndex: 'importanceLevel', key: 'importanceLevel', align: 'center', width: 90 },
  { title: '数据类别', dataIndex: 'dataKind', key: 'dataKind', align: 'center', width: 180 },
  { title: '是否缺失', dataIndex: 'isMissing', key: 'isMissing', align: 'center', width: 90 },
  { title: '接口类型', dataIndex: 'interfaceType', key: 'interfaceType', align: 'center', width: 140 },
])

// 表格数据 - 保留父子层级（参照 performance-accuracy 左侧）
const scoreTableData = computed(() => {
  const root = evaluateTreeRoot.value;
  if (!root) return [];

  const reasonFallback = (text?: string | null) => {
    if (text && text.trim()) return text;
    if (evaluateScoreItem.value?.reason && String(evaluateScoreItem.value.reason).trim()) {
      return evaluateScoreItem.value.reason;
    }
    return '';
  };

  const result: any[] = [];
  const walk = (node: any, level = 0) => {
    if (!node) return;
    result.push({
      dimension: node.scoreType,
      score: node.score ?? 0,
      weight: node.weight ?? 0,
      reason: level === 0 ? reasonFallback(node.reason) : (node.reason || ''),
      level,
      isParent: Array.isArray(node.evaluateTreeScoresList) && node.evaluateTreeScoresList.length > 0,
    });

    if (node.evaluateTreeScoresList && Array.isArray(node.evaluateTreeScoresList)) {
      node.evaluateTreeScoresList.forEach((child: any) => walk(child, level + 1));
    }
  };

  walk(root, 0);
  return result;
});

// 按 dataGroup 分组智能决策数据
const groupedIntelligentDecisionData = computed(() => {
  const data = props.intelligentDecisionData || [];
  const groups: Record<string, any[]> = {};
  
  data.forEach((item: any) => {
    const groupKey = item.dataGroup || '其他';
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
  });
  
  return groups;
});

// 标签页数据
const intelligentDecisionTabs = computed(() => {
  const groups = groupedIntelligentDecisionData.value;
  const tabs: any[] = [];
  
  // 优先显示"飞行仿真"和"武器系统"
  const priorityOrder = ['飞行仿真', '武器系统'];
  
  priorityOrder.forEach(key => {
    if (groups[key] && groups[key].length > 0) {
      tabs.push({
        key,
        label: key,
        data: groups[key]
      });
    }
  });
  
  // 添加其他分组
  Object.keys(groups).forEach(key => {
    if (!priorityOrder.includes(key) && groups[key].length > 0) {
      tabs.push({
        key,
        label: key || '其他',
        data: groups[key]
      });
    }
  });
  
  return tabs;
});

// 当前选中的标签页
const activeTabKey = ref<string>('')

// 折叠面板的激活键（按标签页存储）
const collapseActiveKeys = ref<Record<string, string[]>>({})

// 监听标签页数据变化，自动设置第一个标签页为激活状态，并默认展开所有折叠面板
watch(intelligentDecisionTabs, (tabs) => {
  if (tabs.length > 0) {
    // 如果当前激活的标签页不存在，或者没有激活的标签页，则设置为第一个
    const currentTabExists = tabs.some(tab => tab.key === activeTabKey.value)
    if (!currentTabExists || !activeTabKey.value) {
      activeTabKey.value = tabs[0].key
    }
    
    // 为每个标签页默认展开所有折叠面板
    tabs.forEach(tab => {
      const groups = groupDataByType(tab.data)
      const allKeys = groups.map(group => group.type)
      if (allKeys.length > 0) {
        collapseActiveKeys.value[tab.key] = allKeys
      }
    })
  } else {
    activeTabKey.value = ''
  }
}, { immediate: true })

// 监听当前标签页变化，确保切换标签页时也展开所有折叠面板
watch(activeTabKey, (newKey) => {
  if (newKey) {
    const currentTab = intelligentDecisionTabs.value.find(tab => tab.key === newKey)
    if (currentTab) {
      const groups = groupDataByType(currentTab.data)
      const allKeys = groups.map(group => group.type)
      if (allKeys.length > 0) {
        collapseActiveKeys.value[newKey] = allKeys
      }
    }
  }
})
</script>

<template>
  <div class="w-full h-full flex  flex-col gap-5">
    <div class="w-full h-full flex gap-5">
      <Card class="p-6 w-[55%] flex flex-col gap-6">
        <!-- 空状态 -->
        <a-empty
          class="flex-center flex-col flex-1"
          v-if="!evaluateScoreItem"
          :image="Empty"
          :image-style="{height: '100px'}">
          <template #description>
            <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              暂无评估结果数据，请选择右侧数据点击评估，对智能决策模型接口进行评估。
              <ArrowRightOutlined class="text-blue-500"/>
            </div>
          </template>
        </a-empty>
        
        <!-- 有数据时的显示 -->
        <div v-if="evaluateScoreItem" class="flex flex-col gap-6 h-full">
          <!-- 得分圆圈 -->
          <div class="flex justify-center items-center py-4">
            <div class="relative w-64 h-64">
              <!-- 外层渐变圆环（进度条） -->
              <div class="absolute inset-0 rounded-full">
                <svg class="w-full h-full" viewBox="0 0 100 100">
                  <!-- 背景轨道 -->
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#f0f2f5"
                    stroke-width="8"
                    class="dark:stroke-[#1e293b]"
                  />
                  <!-- 进度条（渐变） -->
                  <circle
                    v-if="evaluateScoreItem?.score > 0"
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    stroke-width="8"
                    stroke-linecap="round"
                    :stroke-dasharray="progressDashArray"
                    transform="rotate(-90 50 50)"
                    class="transition-all duration-1000 ease-out"
                  />
                  <!-- 渐变定义 -->
                  <defs>
                    <linearGradient id="scoreGradient">
                      <stop offset="0%" stop-color="#3b82f6"/>
                      <stop offset="100%" stop-color="#1d4ed8"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <!-- 中间数字和文字 -->
              <div class="absolute inset-0 flex flex-col items-center justify-center z-10">
                <div class="text-7xl font-bold text-gray-900 dark:text-white leading-none mb-5 tracking-tight">
                  {{ currentScore }}
                </div>
                <div class="text-lg text-gray-600 dark:text-gray-400 font-medium">
                  得分
                </div>
              </div>
            </div>
          </div>
          
          <!-- 得分项表格 -->
          <div class="w-full flex justify-center">
            <div class="w-full max-w-4xl">
              <a-table
                :columns="scoreColumns"
                :data-source="scoreTableData"
                :pagination="false"
                :row-class-name="(record) => {
                  let className = '';
                  if (record.level === 0) {
                    className = 'root-row';
                  } else if (record.level === 1) {
                    className = 'parent-row';
                  } else {
                    className = 'child-row';
                  }
                  return className;
                }"
                bordered
                size="middle"
                class="rounded-lg overflow-hidden">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'dimension'">
                    <div :class="[
                      'flex items-center',
                      record.level === 0 ? 'font-semibold text-gray-900 dark:text-white' : 
                      record.level === 1 ? 'font-semibold text-gray-800 dark:text-gray-200' : 
                      'text-gray-700 dark:text-gray-300'
                    ]" :style="record.level > 0 ? { paddingLeft: `${record.level * 24}px` } : {}">
                      <span v-if="record.level > 0" class="mr-2 text-gray-400">└─</span>
                      <span>{{ record.dimension }}</span>
                    </div>
                  </template>
                  <template v-else-if="column.key === 'score'">
                    <span :class="[
                      record.level === 0 ? 'font-bold text-gray-900 dark:text-white' : 
                      record.level === 1 ? 'font-semibold text-gray-800 dark:text-gray-200' : 
                      'font-semibold text-gray-700 dark:text-gray-300'
                    ]">
                      {{ record.score }}
                    </span>
                  </template>
                  <template v-else-if="column.key === 'weight'">
                    <span :class="[
                      record.level === 0 ? 'font-bold text-gray-900 dark:text-white' : 
                      record.level === 1 ? 'font-semibold text-gray-800 dark:text-gray-200' : 
                      'font-semibold text-gray-700 dark:text-gray-300'
                    ]">
                      {{ record.weight }}
                    </span>
                      </template>
                  <template v-else-if="column.key === 'reason'">
                    <span v-if="record.level === 0" class="text-gray-400 dark:text-gray-500">
                      {{ record.reason && record.reason.trim() ? record.reason : '-' }}
                    </span>
                    <span v-else class="text-gray-600 dark:text-gray-400">
                      {{ record.reason && record.reason.trim() ? record.reason : '无扣分' }}
                    </span>
                </template>
                </template>
              </a-table>
            </div>
          </div>
        </div>
      </Card>
      <Card class="p-0 w-[45%]">
        <CardContent class="flex flex-col gap-0">
          <!-- 顶部按钮行：加载数据 + 评估 -->
          <div class="flex justify-between items-center px-4 pt-4 pb-2 gap-3">
            <a-button type="default" :icon="h(DatabaseOutlined)" @click="handleLoadAllData">
              加载数据
            </a-button>
            <a-button type="primary" :icon="h(SendOutlined)" @click="handleEvaluateData">
              评估
            </a-button>
          </div>
          <div class="flex justify-end items-center pt-2  pb-4 px-4">
            <a-form layout="inline">
              <a-form-item>
              <a-popover v-model:open="visible" trigger="click" placement="bottom">
                <template #content>
                  <a-upload-dragger
                    :file-list="fileList"
                    name="file"
                    @change="onUploadChange"
                    @remove="onRemove"
                    :before-upload="beforeUpload"
                  >
                    <p class="ant-upload-drag-icon">
                      <InboxOutlined/>
                    </p>
                    <p class="ant-upload-text">点击或拖拽文件到该区域进行文件上传</p>
                    <p class="ant-upload-hint">
                      支持单个或批量上传。严禁上传公司数据或其他受限制的文件。
                    </p>
                  </a-upload-dragger>
                  <a-button @click="onSubmit('ZN')" class="mt-3 w-full"
                            :loading="uploading"
                            :disabled="fileList?.length === 0">
                    {{ uploading ? '上传中' : '开始上传' }}
                  </a-button>
                </template>
                <a-button type="primary" :icon="h(UploadOutlined)">上传接口</a-button>
              </a-popover>
            </a-form-item>

            <a-form-item layout="inline">
              <a-popover v-model:open="zne_visible" trigger="click" placement="bottom">
                <template #content>
                  <a-upload-dragger
                    :file-list="fileList"
                    name="file"
                    @change="onUploadChange"
                    @remove="onRemove"
                    :before-upload="beforeUpload"
                  >
                    <p class="ant-upload-drag-icon">
                      <InboxOutlined/>
                    </p>
                    <p class="ant-upload-text">点击或拖拽文件到该区域进行文件上传</p>
                    <p class="ant-upload-hint">
                      支持单个或批量上传。严禁上传公司数据或其他受限制的文件。
                    </p>
                  </a-upload-dragger>
                  <a-button @click="onSubmit('EZN')" class="mt-3 w-full"
                            :loading="uploading"
                            :disabled="fileList?.length === 0">
                    {{ uploading ? '上传中' : '开始上传' }}
                  </a-button>
                </template>
                <a-button type="primary" :icon="h(UploadOutlined)">上传评估数据</a-button>
              </a-popover>
            </a-form-item>
              <!-- <a-form-item>
                <a-button type="default" :icon="h(DatabaseOutlined)" @click="handleLoadData">
                  加载数据
                </a-button>
              </a-form-item> -->
              <a-form-item>
                <a-button type="link" :icon="h(DownloadOutlined)"
                          @click="handleDownloadTemplate('支持智能决策模型生成与评估.xlsx')">
                  下载Excel模版
                </a-button>
              </a-form-item>
              <a-form-item>
                <a-button type="link" :icon="h(DownloadOutlined)"
                          @click="handleDownloadTemplate('对抗过程与场景可视化模板.xlsx')">
                  下载"对抗过程与场景可视化"模版
                </a-button>
              </a-form-item>
            </a-form>
          </div>
          <div class="px-4 pb-4">
            <a-table
              :columns="intelligentColumns"
              :data-source="intelligentData"
              :pagination="false"
              size="small"
              bordered
            />
          </div>
          <div class="px-4 pb-4">
            <a-tabs v-model:activeKey="activeTabKey" v-if="intelligentDecisionTabs.length > 0">
              <a-tab-pane v-for="tab in intelligentDecisionTabs" :key="tab.key" :tab="tab.label">
                <div class="overflow-y-auto max-h-[600px]">
                  <a-collapse 
                    :activeKey="collapseActiveKeys[tab.key] || []" 
                    @change="(keys) => collapseActiveKeys[tab.key] = keys"
                    :bordered="false" 
                    ghost
                  >
                    <a-collapse-panel 
                      v-for="group in groupDataByType(tab.data)" 
                      :key="group.type"
                      :header="`${group.type} (${group.count}项)`"
                      class="mb-2"
                    >
                      <div class="space-y-1.5">
                        <div 
                          v-for="(item, index) in group.data" 
                          :key="index"
                          class="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2.5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all"
                        >
                          <!-- 第一行：数据内容（突出显示） -->
                          <div class="flex items-center justify-between mb-2 gap-2">
                            <div class="flex items-center gap-2 flex-1 min-w-0">
                              <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">数据内容：</span>
                              <span class="text-base font-semibold text-gray-900 dark:text-white flex-1 min-w-0 break-words">
                                {{ item.dataContent || '-' }}
                              </span>
                            </div>
                            <div class="flex items-center gap-2 flex-shrink-0">
                              <span 
                                :class="[
                                  'px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap',
                                  item.importanceLevel === '1' ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                                  item.importanceLevel === '2' ? 'bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' :
                                  'bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                ]"
                              >
                                等级{{ item.importanceLevel || '-' }}
                              </span>
                              <div class="flex items-center gap-1">
                                <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">是否缺失：</span>
                                <span 
                                  :class="[
                                    'px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap',
                                    item.isMissing === '否' ? 'bg-green-50 text-green-600 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                                    'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                  ]"
                                >
                                  {{ item.isMissing || '-' }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <!-- 第二行：其他信息 -->
                          <div class="flex flex-wrap items-start gap-x-4 gap-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <span class="flex items-center flex-shrink-0">
                              <span class="font-medium mr-1">类型：</span>
                              <span class="text-gray-700 dark:text-gray-300">{{ item.valueType || '-' }}</span>
                            </span>
                            <span class="flex items-center flex-shrink-0">
                              <span class="font-medium mr-1">接口：</span>
                              <span class="text-gray-700 dark:text-gray-300">{{ item.interfaceType || '-' }}</span>
                            </span>
                            <span class="flex items-start flex-1 min-w-0">
                              <span class="font-medium mr-1 flex-shrink-0">类别：</span>
                              <span class="text-gray-700 dark:text-gray-300 break-words">{{ item.dataKind || '-' }}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </a-collapse-panel>
                  </a-collapse>
                </div>
              </a-tab-pane>
            </a-tabs>
            <a-empty v-else description="暂无数据" />
          </div>
          <!-- <a-table
            :columns="columns"
            :data-source="datasource"
            bordered
            size="small"
            :pagination="false"
          >
          </a-table> -->
        </CardContent>
        <CardFooter class="w-full flex-center p-0 justify-center ">
        </CardFooter>
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

/* 根级行样式 */
:deep(.ant-table-tbody > tr.root-row) {
    background-color: #f0f4f8;
}

:deep(.dark .ant-table-tbody > tr.root-row) {
    background-color: #1e2937;
}

/* 父级行样式（level 1） */
:deep(.ant-table-tbody > tr.parent-row) {
    background-color: #f9fafb;
}

:deep(.dark .ant-table-tbody > tr.parent-row) {
    background-color: #1f2937;
}

/* 子级行样式（level 2+） */
:deep(.ant-table-tbody > tr.child-row) {
    background-color: #ffffff;
}

:deep(.dark .ant-table-tbody > tr.child-row) {
    background-color: #111827;
}

/* 根级行悬停效果 */
:deep(.ant-table-tbody > tr.root-row:hover > td) {
    background-color: #e2e8f0 !important;
}

:deep(.dark .ant-table-tbody > tr.root-row:hover > td) {
    background-color: #334155 !important;
}

/* 父级行悬停效果 */
:deep(.ant-table-tbody > tr.parent-row:hover > td) {
    background-color: #f3f4f6 !important;
}

:deep(.dark .ant-table-tbody > tr.parent-row:hover > td) {
    background-color: #374151 !important;
}
</style>
