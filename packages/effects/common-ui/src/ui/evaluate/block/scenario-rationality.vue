<script setup lang="ts">
import {h, computed, ref, reactive, defineProps} from 'vue'
import {
  ClearOutlined,
  DatabaseOutlined,
  DeleteOutlined, DownloadOutlined,
  EyeOutlined, InboxOutlined, UploadOutlined,
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
import {VbenButton} from '@vben/common-ui'
import './index.css'
import original from '../../../assets/images/original.png'
import dayjs from "dayjs";
import {ViewXDDataModal} from './component'
import {message, type UploadChangeParam, type UploadProps} from "ant-design-vue";

interface Props {
  /**
   * @zh_CN 数据列表
   */
  datasource: any,

  /**
   * @zh_CN 评估数据
   */
  evaluateScore: any,
}

//  默认值
const props = withDefaults(defineProps<Props>(), {
  datasource: [],
  evaluateScore: [],
})
// 传递事件
const emit = defineEmits<{
  'update:submitUpload': [value: any],
  'update:downloadTemplate': [value: any],
  'update:loadData': [],
  'update:deleteData': [value: any],
  'update:evaluate': [value: any],
}>()
// 空值
const Empty = ref(original)
// 上传的文件列表
const fileList = ref<UploadProps['fileList']>([]);
// 上传状态
const uploading = ref<boolean>(false);
// 上传数据气泡框
const visible = ref<boolean>(false);
// 数据预览模态框打开状态
const opened = ref(false)
// 权值数据
const weightData = computed(() => {
  return []
})
// 评估数据
const evaluation_data = ref([])
// 数据详情
const tableData = ref([])

// 处理数据源，将 dataList[0] 的字段合并到表格行数据中
// 处理数据源，将 dataList 中的每条数据都展开成一行
const processedDataSource = computed(() => {
  if (!props.datasource || !Array.isArray(props.datasource)) {
    return []
  }
  
  const result: any[] = []
  
  props.datasource.forEach((item: any) => {
    const dataList = item.dataList || []
    
    // 如果 dataList 为空，至少显示一条记录（只有 dataId）
    if (dataList.length === 0) {
      result.push({
        ...item,
        key: item.id || item.key || `empty-${item.dataId}`,
        myAircraftQuantity: '',
        enemyAircraftQuantity: '',
        identification: '',
        initialMyAircraft: '',
        initialEnemyAircraft: '',
        aircraftGunsQuantity: '',
        shortRangeMissilesQuantity: '',
        mediumLongRangeMissilesQuantity: '',
        shortRangeCombat: '',
        mediumLongRangeCombat: '',
        classificationRationality: '',
        basicFormation: '',
        shortRangeFormation: '',
        mediumRangeFormation: '',
        longRangeFormation: '',
      })
    } else {
      // 遍历 dataList 中的每条数据，为每条数据创建一行
      dataList.forEach((dataItem: any, index: number) => {
        // 辅助函数：获取字段值，支持驼峰和下划线两种格式，优先使用有值的
        const getFieldValue = (camelCase: string, snakeCase: string) => {
          return dataItem[camelCase] ?? dataItem[snakeCase] ?? ''
        }
        
        result.push({
          ...item,
          key: `${item.id || item.key || item.dataId}-${index}`,
          // 从 dataItem 中提取所有字段值，支持驼峰和下划线两种格式
          myAircraftQuantity: getFieldValue('myAircraftQuantity', 'my_aircraft_quantity'),
          enemyAircraftQuantity: getFieldValue('enemyAircraftQuantity', 'enemy_aircraft_quantity'),
          identification: getFieldValue('identification', 'identification'),
          initialMyAircraft: getFieldValue('initialMyAircraft', 'initial_my_aircraft'),
          initialEnemyAircraft: getFieldValue('initialEnemyAircraft', 'initial_enemy_aircraft'),
          aircraftGunsQuantity: getFieldValue('aircraftGunsQuantity', 'aircraft_guns_quantity'),
          shortRangeMissilesQuantity: getFieldValue('shortRangeMissilesQuantity', 'short_range_missiles_quantity'),
          mediumLongRangeMissilesQuantity: getFieldValue('mediumLongRangeMissilesQuantity', 'medium_long_range_missiles_quantity'),
          shortRangeCombat: getFieldValue('shortRangeCombat', 'short_range_combat'),
          mediumLongRangeCombat: getFieldValue('mediumLongRangeCombat', 'medium_long_range_combat'),
          classificationRationality: getFieldValue('classificationRationality', 'classification_rationality'),
          basicFormation: getFieldValue('basicFormation', 'basic_formation'),
          shortRangeFormation: getFieldValue('shortRangeFormation', 'short_range_formation'),
          mediumRangeFormation: getFieldValue('mediumRangeFormation', 'medium_range_formation'),
          longRangeFormation: getFieldValue('longRangeFormation', 'long_range_formation'),
        })
      })
    }
  })
  
  return result
})
// 定义数据表格列 - 只显示五个字段（不包含数据ID）
const columns = ref([
  {
    title: '我方飞机数量',
    dataIndex: 'myAircraftQuantity',
    key: 'myAircraftQuantity',
    width: 120,
    align: 'center',
    ellipsis: true,
  },
  {
    title: '敌方飞机数量',
    dataIndex: 'enemyAircraftQuantity',
    key: 'enemyAircraftQuantity',
    width: 120,
    align: 'center',
    ellipsis: true,
  },
  {
    title: '敌我标识',
    dataIndex: 'identification',
    key: 'identification',
    width: 100,
    align: 'center',
    ellipsis: true,
  },
  {
    title: '近距空战想定',
    dataIndex: 'shortRangeCombat',
    key: 'shortRangeCombat',
    width: 130,
    align: 'center',
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    align: 'center',
    fixed: 'right',
  },
])


// 选择状态
const state = reactive({
  selectedRowKeys: [],
  selectedRow: null
})

/* 单选配置 */
const rowSelection = computed(() => ({
  type: 'radio',
  selectedRowKeys: state.selectedRowKeys,
  onChange: (keys, rows) => {
    state.selectedRowKeys = keys.length ? [keys[keys.length - 1]] : []
    state.selectedRow = rows.length ? rows[rows.length - 1] : null
  }
}))

// 下载模版
const handleDownloadTemplate = (value: any) => {
  emit('update:downloadTemplate', value)
}
// 自定义上传接口
const handleUploadSubmit = async () => {
  const formData = new FormData();
  fileList.value?.forEach((file: UploadProps['fileList'][any]) => {
    formData.append('file', file as any);
  });
  uploading.value = true;
  emit('update:submitUpload', formData)
  uploading.value = false
  // 加载数据
  handleLoadData()
}
// 上传之前的校验
const handleBeforeUpload: UploadProps['beforeUpload'] = file => {
  fileList.value = [file];
  return false;
};
// 删除文件
const handleUploadRemove: UploadProps['onRemove'] = file => {
  const index = fileList.value?.indexOf(file);
  const newFileList = fileList.value?.slice();
  newFileList.splice(index, 1);
  fileList.value = newFileList;
};
// 文件上传
const handleUploadChange = (info: UploadChangeParam) => {
  const status = info.file.status;
  if (status !== 'uploading') {
    message.success(`${info.file.name} 文件上传成功。`);
  }
  if (status === 'done') {
    message.success(`${info.file.name} 文件上传成功。`);
  } else if (status === 'error') {
    message.error(`${info.file.name} 文件上传失败。`);
  }
};

// 拖拽上传
function handleUploadDrop(e: DragEvent) {
  console.log(e);
}

// 加载数据
const handleLoadData = () => {
  emit('update:loadData')
}

// 取消选择
const handleClearTableSelect = () => {
  state.selectedRowKeys = []
  state.selectedRow = null
}

// 表格删除
const handleDeleteRow = (value: any) => {
  emit('update:deleteData', value)
}
// 数据预览
const handleViewRow = (value: any) => {
  tableData.value = value.dataList
  opened.value = true
}
const handleEvaluate = () => {
  if (!state.selectedRow || state.selectedRow.length === 0) {
    return message.warn("请选择评估数据")
  }
  emit("update:evaluate", state.selectedRow['dataList'])
}

// 计算进度条
const circleRadius = 44; // 圆的半径
const circleCircumference = 2 * Math.PI * circleRadius; // 圆的周长 ≈ 276.48

// 计算进度条的 stroke-dasharray
const progressDashArray = computed(() => {
  if (!props.evaluateScore || props.evaluateScore.length === 0) {
    return `0 ${circleCircumference}`;
  }
  const score = Number(props.evaluateScore[0]['score']) || 0;
  // 得分百分比（56.2 就是 56.2%）
  const percentage = Math.min(Math.max(score, 0), 100) / 100;
  // 进度条长度
  const progressLength = circleCircumference * percentage;
  // 剩余长度
  const remainingLength = circleCircumference - progressLength;
  return `${progressLength} ${remainingLength}`;
});

// 获取当前得分（直接显示接口返回的值）
const currentScore = computed(() => {
  if (!props.evaluateScore || props.evaluateScore.length === 0) {
    return 0;
  }
  // 直接返回接口返回的值，不进行格式化
  return props.evaluateScore[0]['score'] ?? 0;
});

// 表格列定义
const scoreColumns = computed(() => [
  {
    title: '评估要素',
    dataIndex: 'name',
    key: 'name',
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

// 表格数据 - 保留父子层级关系
const scoreTableData = computed(() => {
  if (!props.evaluateScore || props.evaluateScore.length === 0) {
    return [];
  }
  
  const dataList = props.evaluateScore[0]['dataList'];
  if (!dataList || typeof dataList !== 'object') {
    return [];
  }
  
  // 递归处理树形结构，保留层级关系
  const processTree = (node: any, level: number = 0): any[] => {
    const result: any[] = [];
    
    // 添加当前节点
    if (node.name) {
      result.push({
        name: node.name,
        score: node.score ?? 0,
        weight: node.weight ?? 0,
        reason: node.reason || '',
        level: level,
        isParent: level === 0 || (node.children && node.children.length > 0),
        isCalculate: node.isCalculate ?? false,
      });
    }
    
    // 递归处理子节点
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      node.children.forEach((child: any) => {
        result.push(...processTree(child, level + 1));
      });
    }
    
    return result;
  };
  
  return processTree(dataList);
});
</script>

<template>
  <div class="w-full h-full flex  flex-col gap-5">
    <div class="w-full h-full flex gap-5">
      <Card class="p-6 w-[60%] flex flex-col gap-6">
        <!-- 空状态 -->
        <a-empty
          class="flex-center flex-col flex-1"
          v-if="evaluateScore.length ===0"
          :image="Empty"
          :image-style="{height: '100px'}">
          <template #description>
            <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              暂无评估结果数据，请选择右侧数据点击评估，对模型性能参数数据进行评估。
              <ArrowRightOutlined class="text-blue-500"/>
            </div>
          </template>
        </a-empty>
        
        <!-- 有数据时的显示 -->
        <div v-if="evaluateScore && evaluateScore.length !==0" class="flex flex-col gap-6 h-full">
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
                    v-if="props.evaluateScore && props.evaluateScore.length > 0 && props.evaluateScore[0]['score'] > 0"
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
                  // 根据 isCalculate 添加标识
                  if (record.isCalculate) {
                    className += ' calculated-row';
                  } else {
                    className += ' not-calculated-row';
                  }
                  return className;
                }"
                bordered
                size="middle"
                class="rounded-lg overflow-hidden">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'name'">
                    <div :class="[
                      'flex items-center',
                      record.level === 0 ? 'font-semibold text-gray-900 dark:text-white' : 
                      record.level === 1 ? 'font-semibold text-gray-800 dark:text-gray-200' : 
                      'text-gray-700 dark:text-gray-300'
                    ]" :style="record.level > 0 ? { paddingLeft: `${record.level * 24}px` } : {}">
                      <span v-if="record.level > 0" class="mr-2 text-gray-400">└─</span>
                      <a-tooltip>
                        <template #title>
                          {{ record.isCalculate ? '参与计算' : '不参与计算' }}
                      </template>
                        <span v-if="record.isCalculate" 
                              class="inline-flex items-center mr-1.5 w-2 h-2 rounded-full bg-green-500 cursor-help">
                        </span>
                        <span v-else 
                              class="inline-flex items-center mr-1.5 w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 cursor-help">
                        </span>
                      </a-tooltip>
                      <span>{{ record.name }}</span>
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
                      -
                    </span>
                    <span v-else-if="record.name === '基础参数合理性'" class="text-gray-600 dark:text-gray-400">
                      未参与计算
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
      <Card class="h-full w-[40%]">
        <CardContent class="flex flex-col gap-0">
          <div class="flex justify-end items-center pt-4  pb-4">
            <a-form layout="inline">
              <a-form-item>
                <a-button type="default" :icon="h(DatabaseOutlined)" @click="handleLoadData">
                  加载数据
                </a-button>
              </a-form-item>
              <a-form-item>
                <a-popover v-model:open="visible" trigger="click" placement="bottom">
                  <template #content>
                    <a-upload-dragger
                      :file-list="fileList"
                      name="file"
                      @change="handleUploadChange"
                      @drop="handleUploadDrop"
                      @remove="handleUploadRemove"
                      :before-upload="handleBeforeUpload"
                    >
                      <p class="ant-upload-drag-icon">
                        <InboxOutlined/>
                      </p>
                      <p class="ant-upload-text">点击或拖拽文件到该区域进行文件上传</p>
                      <p class="ant-upload-hint">
                        支持单个或批量上传。严禁上传公司数据或其他受限制的文件。
                      </p>
                    </a-upload-dragger>
                    <a-button @click="handleUploadSubmit" class="mt-3 w-full"
                              :loading="uploading"
                              :disabled="fileList?.length === 0">
                      {{ uploading ? '上传中' : '开始上传' }}
                    </a-button>
                  </template>
                  <a-button type="primary" :icon="h(UploadOutlined)">上传数据</a-button>
                </a-popover>
              </a-form-item>
              
              <a-form-item>
                <a-button danger :icon="h(ClearOutlined)" @click="handleClearTableSelect">
                  取消选择
                </a-button>
              </a-form-item>
              <a-form-item>
                <a-button type="link" :icon="h(DownloadOutlined)"
                          @click="handleDownloadTemplate('想定合理性评估数据Excel模板.xlsx')">
                  下载Excel模版
                </a-button>
              </a-form-item>
            </a-form>
          </div>
          <a-table
            :columns="columns"
            :row-selection="rowSelection"
            :data-source="processedDataSource"
            :bordered="true"
            :scroll="{ x: 'max-content', y: 400 }"
            size="small"
            :pagination="false"
            class="optimized-table"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'dataId'">
                <span>
                  {{ dayjs(record.dataId).format('YYYY-MM-DD HH:mm:ss') }}
                </span>
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" danger size="small" title="预览"
                            @click="handleViewRow(record)">
                    <EyeOutlined/>
                  </a-button>
                  <a-button type="link" danger size="small" title="删除"
                            @click="handleDeleteRow(record)">
                    <DeleteOutlined/>
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </CardContent>
        <CardFooter class="w-full flex-center p-5 justify-center">
          <VbenButton class="w-1/3 h-2/3" @click="handleEvaluate">
            <SendOutlined class="mr-2"/>
            评估
          </VbenButton>
        </CardFooter>
      </Card>
    </div>

    <ViewXDDataModal v-if="opened"
                     v-model:opened="opened"
                     v-model:datasource="tableData"/>
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

/* 优化表格显示 */
:deep(.optimized-table) {
    font-size: 13px;
}

:deep(.optimized-table .ant-table-thead > tr > th) {
    background-color: #fafafa;
    font-weight: 600;
    padding: 8px 12px;
}

:deep(.dark .optimized-table .ant-table-thead > tr > th) {
    background-color: #1f2937;
}

:deep(.optimized-table .ant-table-tbody > tr > td) {
    padding: 8px 12px;
}

/* 列分组表头样式 */
:deep(.optimized-table .ant-table-thead > tr > th[colspan]) {
    background-color: #e8f4f8;
    font-weight: 600;
}

:deep(.dark .optimized-table .ant-table-thead > tr > th[colspan]) {
    background-color: #1e3a5f;
}

/* 表格行悬停效果 */
:deep(.optimized-table .ant-table-tbody > tr:hover > td) {
    background-color: #f5f5f5 !important;
}

:deep(.dark .optimized-table .ant-table-tbody > tr:hover > td) {
    background-color: #2d3748 !important;
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
