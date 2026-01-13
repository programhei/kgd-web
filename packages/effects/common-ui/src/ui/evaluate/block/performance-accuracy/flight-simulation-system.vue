<script setup lang="ts">
import {computed, defineProps, reactive, ref, defineEmits, h, watch} from 'vue'
import {
  DeleteOutlined,
  UploadOutlined,
  SendOutlined,
  ArrowRightOutlined,
  EyeOutlined,
  DownloadOutlined,
  InboxOutlined,
  FilterOutlined,
  FlagOutlined,
  PlusOutlined,
  CloseOutlined, ExclamationOutlined
} from '@ant-design/icons-vue'
import {
  Card,
  CardContent,
  CardFooter
} from '@vben-core/shadcn-ui';

import '../index.css'
import original from '../../../../assets/images/original.png'
import {message, type UploadChangeParam, type UploadProps} from "ant-design-vue";
import dayjs from 'dayjs'
import {ViewXNDataModal} from "../component";
import {v4 as uuid} from 'uuid';

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
// 上传数据气泡框
const compareVisible = ref<boolean>(false);
// 上传数据气泡框
const xnVisible = ref<boolean>(false);
// 数据预览模态框打开状态
const opened = ref(false)
// 是否是标准数据
const activeKey = ref<string>('否')


// 评估数据
const evaluation_data = ref([])
// 数据详情
const tableData = ref([])
// 单元格
const columns = ref([
  {
    title: '评估维度',
    dataIndex: 'dataType',
    key: 'dataType',
    align: 'center',
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    align: 'center'
  },
])
const flight_controller_datasource = computed(() => {
  // 统一成数组，避免下标 0 写死
  const dsArray = Array.isArray(props.datasource)
    ? props.datasource
    : [props.datasource];

  // 找到目标维度
  const target = dsArray
    .flatMap(ds => ds?.datasource1 ?? [])
    .find(v => v.dimension === '飞行控制系统模型准确度');

  // 给 children 加 key
  return (target?.children ?? []).map(item => ({
    ...item,
    key: uuid(),
    dimension: '飞行控制系统模型准确度'
  }));
});
const columns_specific_fuel_consumption = ref([
  {
    title: '评估维度',
    dataIndex: 'dataType',
    key: 'dataType',
    align: 'center',
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    align: 'center'
  },
])

const specific_fuel_consumption_datasource = computed(() => {
  const list =
    props.datasource?.[0]?.datasource1
      ?.find((v: any) => v.dimension === '发动机推力模型准确度')
      ?.children ?? [];

  // 给每条数据注入 uuid（不污染原数组）
  return list.map((item: any) => ({...item, key: uuid(), dimension: '发动机推力模型准确度'}));
});


const columns_flight_acceleration = ref([
  {
    title: '编号',
    dataIndex: 'id',
    key: 'id',
    width: 180,
    align: 'center',
    ellipsis: true,
  },
  {
    title: '最大速度',
    dataIndex: 'maximumSpeed',
    key: 'maxSpeed',
    align: 'center',
    ellipsis: true,
  },
  {
    title: '最大加速度',
    dataIndex: 'acceleration',
    key: 'acceleration',
    align: 'center',
    ellipsis: true,
  },
])

const flight_acceleration_datasource = computed(() => {
  // 1. 兼容数组或对象，统一成数组
  const dsArray = Array.isArray(props.datasource)
    ? props.datasource
    : [props.datasource];

  // 2. 在任意 datasource2 里找目标
  const target = dsArray
    .flatMap(ds => ds?.datasource2 ?? [])
    .find(v => v.dataType === '飞行加速性能准确度');

  // 3. 给 flightModelList 加 key
  return (target?.flightModelList ?? []).map(item => ({...item, key: uuid()}));
});

const columns_flight_overload = ref([
  {
    title: '最大过载',
    dataIndex: 'maximumOverload',
    key: 'maxOverload',
    align: 'center',
    ellipsis: true,
  },
  {
    title: '最大转弯速率',
    dataIndex: 'fuelRate',
    key: 'fuelRate',
    align: 'center',
    ellipsis: true,
  },
])

const flight_overload_datasource = computed(() => {
  const list = props.datasource?.[0]?.datasource2;
  const target = list?.find(v => v.dataType === '飞行转弯性能准确度');
  return target?.flightModelList ?? [].map(item => ({...item, key: uuid()}));
})

// 场景切换：飞行仿真 / 武器系统
const scenarioType = ref('飞行仿真');
const handleScenarioChange = (value: string) => {
  scenarioType.value = value;
  emit('update:loadData'); // 仅触发数据重载，具体过滤由父层/接口决定
};

// 选择状态
const state = reactive({
  selectedRowKeys: [],
  selectedRow: null,
  selectedSpecificFuelConsumptionRowKeys: [],
  selectedSpecificFuelConsumptionRow: null,
  selectedFlightAccelerationRowKeys: [],
  selectedFlightAccelerationRow: null,
  selectedFlightOverloadRowKeys: [],
  selectedFlightOverloadRow: null
})
/* 单选配置 */
const rowSelection = computed(() => ({
  type: 'checkbox',
  selectedRowKeys: state.selectedRowKeys,
  onChange: (keys, rows) => {
    state.selectedRowKeys = keys.length ? keys : []
    state.selectedRow = rows.length ? rows : null
  }
}))

const specific_fuel_consumption_rowSelection = computed(() => ({
  type: 'radio',
  selectedRowKeys: state.selectedSpecificFuelConsumptionRowKeys,
  onChange: (keys, rows) => {
    state.selectedSpecificFuelConsumptionRowKeys = keys.length ? keys : []
    state.selectedSpecificFuelConsumptionRow = rows.length ? rows : null
  }
}))

/* 单选配置 */
const flight_acceleration_rowSelection = computed(() => ({
  type: 'radio',
  selectedRowKeys: state.selectedFlightAccelerationRowKeys,
  onChange: (keys, rows) => {
    state.selectedFlightAccelerationRowKeys = keys.length ? [keys[keys.length - 1]] : []
    state.selectedFlightAccelerationRow = rows.length ? [rows[rows.length - 1]] : null
  }
}))

/* 单选配置 */
const flight_overload_rowSelection = computed(() => ({
  type: 'radio',
  selectedRowKeys: state.selectedFlightOverloadRowKeys,
  onChange: (keys, rows) => {
    state.selectedFlightOverloadRowKeys = keys.length ? [keys[keys.length - 1]] : []
    state.selectedFlightOverloadRow = rows.length ? [rows[rows.length - 1]] : null
  }
}))
// 自定义上传接口
const handleUploadSubmit = async (value) => {
  const formData = new FormData();
  fileList.value?.forEach((file: UploadProps['fileList'][number]) => {
    formData.append('file', file as any);
  });
  uploading.value = true;
  emit('update:submitUpload', {formData, isStandard: activeKey.value, isPerformance: value})
  uploading.value = false
  // 关闭上传弹框
  visible.value = false
  // 关闭上传弹框
  compareVisible.value = false
  // 清空上传的文件列表
  fileList.value = []
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
const handleUploadDrop = (e: DragEvent) => {
  console.log(e);
}

// 加载数据
const handleLoadData = () => {
  emit('update:loadData', activeKey.value)
}
// 下载模版
const handleDownloadTemplate = (value: any) => {
  emit('update:downloadTemplate', value)
}
// 取消选择 - 控制比对数据表格（飞行控制系统模型准确度和发动机推力模型准确度）
const handleClearTableSelect = () => {
  state.selectedRowKeys = []
  state.selectedRow = null
  state.selectedSpecificFuelConsumptionRowKeys = []
  state.selectedSpecificFuelConsumptionRow = null
}

// 取消选择 - 控制性能准确度表格（飞行加速性能准确度和飞行转弯性能准确度）
const handleClearPerformanceSelect = () => {
  state.selectedFlightAccelerationRowKeys = []
  state.selectedFlightAccelerationRow = null
  state.selectedFlightOverloadRowKeys = []
  state.selectedFlightOverloadRow = null
}
// 表格删除
const handleDeleteRow = (value: any) => {
  emit('update:deleteData', value)
}
// 数据预览
const handleViewRow = (value: any) => {
  tableData.value = value.flightDataList ?? value.flightModelList
  opened.value = true
}
const handleEvaluate = () => {
  // 标准数据模式下，检查是否有数据存在
  if (activeKey.value === '是') {
    const hasFlightControllerData = flight_controller_datasource.value && flight_controller_datasource.value.length > 0;
    const hasFuelConsumptionData = specific_fuel_consumption_datasource.value && specific_fuel_consumption_datasource.value.length > 0;
    const hasFlightAccelerationData = flight_acceleration_datasource.value && flight_acceleration_datasource.value.length > 0;
    const hasFlightOverloadData = flight_overload_datasource.value && flight_overload_datasource.value.length > 0;
    
    if (!hasFlightControllerData && !hasFuelConsumptionData && !hasFlightAccelerationData && !hasFlightOverloadData) {
      return message.warn("暂无评估数据，请先加载数据")
    }
    
    // 标准数据模式下，使用所有数据
    emit("update:evaluate", {
      variable: '飞行仿真性能准确度',
      compareList: [
        ...(flight_controller_datasource.value || []),
        ...(specific_fuel_consumption_datasource.value || [])
      ],
      xnList: [
        ...(flight_acceleration_datasource.value || []),
        ...(flight_overload_datasource.value || [])
      ]
    })
  } else {
    // 比对数据模式下，需要选择数据
  if (!state.selectedRow || state.selectedRow.length === 0) {
    return message.warn("请选择评估数据")
  }
  emit("update:evaluate", {
    variable: '飞行仿真性能准确度',
      compareList: [
        ...(state.selectedRow || []),
        ...(state.selectedSpecificFuelConsumptionRow || [])
      ],
      xnList: [
        ...(state.selectedFlightAccelerationRow || []),
        ...(state.selectedFlightOverloadRow || [])
      ]
  })
  }
}
watch(() => activeKey.value,
  (v) => {
    emit('update:loadData', activeKey.value)
    fileList.value = []
  }
)

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

// 格式化数字为两位小数，如果为0则显示0
const formatToTwoDecimals = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }
  const num = Number(value);
  if (isNaN(num)) {
    return '0';
  }
  // 如果值为0，直接返回"0"
  if (num === 0) {
    return '0';
  }
  return num.toFixed(2);
};

// 获取当前得分（格式化为两位小数）
const currentScore = computed(() => {
  if (!props.evaluateScore || props.evaluateScore.length === 0) {
    return '0';
  }
  return formatToTwoDecimals(props.evaluateScore[0]['score'] ?? 0);
});

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

// 表格数据 - 保留父子层级关系
const scoreTableData = computed(() => {
  if (!props.evaluateScore || props.evaluateScore.length === 0) {
    return [];
  }
  
  const dataList = props.evaluateScore[0]['dataList'] || [];
  if (dataList.length === 0) {
    return [];
  }
  
  // 处理 dataList，保留父子层级关系
  const result: any[] = [];
  dataList.forEach((item: any) => {
    // 先添加父级项
    if (item.dimension) {
      result.push({
        dimension: item.dimension,
        score: formatToTwoDecimals(item.score ?? 0),
        weight: formatToTwoDecimals(item.weight ?? 0),
        reason: '', // 父级没有失分原因
        level: 0, // 父级标记
        isParent: true,
      });
    }
    
    // 然后添加子级项（children）
    if (item.children && Array.isArray(item.children) && item.children.length > 0) {
      item.children.forEach((child: any) => {
        if (child.dimension) {
          result.push({
            dimension: child.dimension,
            score: formatToTwoDecimals(child.score ?? 0),
            weight: formatToTwoDecimals(child.weight ?? 0),
            reason: child.reason || '', // 失分原因
            level: 1, // 子级标记
            isParent: false,
          });
        }
      });
    }
  });
  
  return result;
});

</script>

<template>
  <div class="w-full h-full flex  flex-col gap-5">
    <div class="w-full h-full flex gap-5">
      <Card class="p-6 w-[59%] flex flex-col gap-6">
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
                :row-class-name="(record) => record.isParent ? 'parent-row' : 'child-row'"
                bordered
                size="middle"
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
        </div>
      </Card>
      <Card class="h-full w-[41%]">
        <CardContent class="flex flex-col gap-0">
          <!-- 顶部操作区域 -->
          <div class="flex flex-col pt-4 pb-4 gap-3 border-b border-gray-200 dark:border-gray-700">
            <!-- 第一行：单选按钮组、加载数据、评估按钮 -->
            <div class="flex justify-between items-center gap-3">
              <div class="flex items-center gap-3">
                
                <a-radio-group v-model:value="activeKey" button-style="solid" class="flex-shrink-0 flex items-center">
                <a-radio-button value="否">
                  <span class="flex items-center gap-2 whitespace-nowrap">
                    <FilterOutlined/>
                    比对数据
                  </span>
                </a-radio-button>
                <a-radio-button value="是">
                  <span class="flex items-center gap-2 whitespace-nowrap">
                    <FlagOutlined/>
                    标准数据
                  </span>
                </a-radio-button>
              </a-radio-group>
              </div>
              <div class="flex items-center gap-2 self-center">
                <a-button type="default" :icon="h(PlusOutlined)" @click="handleLoadData" class="flex-shrink-0">
                  加载数据
                </a-button>
                <a-button type="primary" :icon="h(SendOutlined)" @click="handleEvaluate" class="flex-shrink-0">
                  评估
                </a-button>
              </div>
            </div>
            
            
          </div>
          
          <!-- 操作区域 -->
          <div class="flex flex-col pt-4 pb-4 gap-3">
            <!-- 一行展示所有按钮 -->
            <div class="flex items-center justify-start gap-2 flex-wrap">
              <a-popover v-if="activeKey ==='是'" v-model:open="visible" trigger="click" placement="bottom">
                    <template #content>
                      <div class="flex flex-col">
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
                        <a-button @click="handleUploadSubmit('否')" class="mt-3 w-full"
                                  :loading="uploading"
                                  :disabled="fileList?.length === 0">
                          {{ uploading ? '上传中' : '开始上传' }}
                        </a-button>
                      </div>
                    </template>
                <a-button type="primary" :icon="h(UploadOutlined)" class="flex-shrink-0 whitespace-nowrap">上传标准数据</a-button>
                  </a-popover>
              <a-popover v-if="activeKey ==='否'" v-model:open="compareVisible" trigger="click" placement="bottom">
                    <template #content>
                      <div class="flex flex-col">
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
                        <a-button @click="handleUploadSubmit('否')" class="mt-3 w-full"
                                  :loading="uploading"
                                  :disabled="fileList?.length === 0">
                          {{ uploading ? '上传中' : '开始上传' }}
                        </a-button>
                      </div>
                    </template>
                <a-button type="primary" :icon="h(UploadOutlined)" class="flex-shrink-0 whitespace-nowrap">上传比对数据</a-button>
                  </a-popover>
              <a-button v-if="activeKey ==='否'" :icon="h(CloseOutlined)" danger @click="handleClearTableSelect" class="flex-shrink-0 whitespace-nowrap">
                    取消选择
                  </a-button>
              <a-button type="link" :icon="h(DownloadOutlined)" size="small"
                        @click="handleDownloadTemplate('稳定盘旋准确度Excel模板.xlsx')"
                        class="flex-shrink-0 whitespace-nowrap text-blue-500 hover:text-blue-600">
                下载稳盘模版
              </a-button>
              <a-button type="link" :icon="h(DownloadOutlined)" size="small"
                        @click="handleDownloadTemplate('平飞加速准确度Excel模板.xlsx')"
                        class="flex-shrink-0 whitespace-nowrap text-blue-500 hover:text-blue-600">
                下载平飞模版
              </a-button>
              <a-button type="link" :icon="h(DownloadOutlined)" size="small"
                        @click="handleDownloadTemplate('发动机耗油率Excel模板.xlsx')"
                        class="flex-shrink-0 whitespace-nowrap text-blue-500 hover:text-blue-600">
                下载发动机耗油率模版
              </a-button>
            </div>
          </div>
          <a-divider orientation="left">飞行控制系统模型准确度</a-divider>
          <a-table
            :columns="columns"
            :data-source="flight_controller_datasource"
            :row-selection="activeKey ==='否'?rowSelection:null"
            :bordered="true"
            :pagination="false"
            size="small"
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
                </a-space>
              </template>
            </template>
          </a-table>
          <a-divider orientation="left">发动机推力模型准确度</a-divider>
          <a-table
            :columns="columns_specific_fuel_consumption"
            :data-source="specific_fuel_consumption_datasource"
            :row-selection="activeKey ==='否'?specific_fuel_consumption_rowSelection:null"
            :bordered="true"
            :pagination="false"
            size="small"
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
                </a-space>
              </template>
            </template>
          </a-table>
          
          <!-- 飞行加速性能准确度操作区域 -->
          <div class="flex justify-start items-center pt-4 pb-2 gap-2 flex-wrap">
            <a-space>
                  <a-popover v-model:open="xnVisible" trigger="click" placement="bottom">
                    <template #content>
                      <div class="flex flex-col">
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
                        <a-button @click="handleUploadSubmit('是')" class="mt-3 w-full"
                                  :loading="uploading"
                                  :disabled="fileList?.length === 0">
                          {{ uploading ? '上传中' : '开始上传' }}
                        </a-button>
                      </div>
                    </template>
                <a-button type="primary" :icon="h(UploadOutlined)" class="flex-shrink-0 whitespace-nowrap">上传数据</a-button>
                  </a-popover>
              <a-button :icon="h(CloseOutlined)" danger @click="handleClearPerformanceSelect" class="flex-shrink-0 whitespace-nowrap">
                    取消选择
                  </a-button>
              <a-button type="link" :icon="h(DownloadOutlined)"
                        @click="handleDownloadTemplate('性能准确度飞行仿真.xlsx')"
                        class="flex-shrink-0 whitespace-nowrap text-blue-500 hover:text-blue-600">
                    下载性能准确度飞行仿真Excel模版
                  </a-button>
            </a-space>
          </div>
          <a-divider orientation="left">飞行加速性能准确度</a-divider>
          <a-table
            :columns="columns_flight_acceleration"
            :data-source="flight_acceleration_datasource"
            :row-selection="flight_acceleration_rowSelection"
            :bordered="true"
            :pagination="false"
            size="small"
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
          <a-divider orientation="left">飞行转弯性能准确度</a-divider>
          <a-table
            :columns="columns_flight_overload"
            :data-source="flight_overload_datasource"
            :row-selection="flight_overload_rowSelection"
            :bordered="true"
            :pagination="false"
            size="small"
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
      </Card>
    </div>

    <ViewXNDataModal v-if="opened"
                     v-model:opened="opened"
                     v-model:datasource="tableData"
    />
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

/* 父级行样式 */
:deep(.ant-table-tbody > tr.parent-row) {
    background-color: #f9fafb;
}

:deep(.dark .ant-table-tbody > tr.parent-row) {
    background-color: #1f2937;
}

/* 子级行样式 */
:deep(.ant-table-tbody > tr.child-row) {
    background-color: #ffffff;
}

:deep(.dark .ant-table-tbody > tr.child-row) {
    background-color: #111827;
}

/* 父级行悬停效果 */
:deep(.ant-table-tbody > tr.parent-row:hover > td) {
    background-color: #f3f4f6 !important;
}

:deep(.dark .ant-table-tbody > tr.parent-row:hover > td) {
    background-color: #374151 !important;
}

/* 单选按钮组样式优化 */
:deep(.ant-radio-group) {
    min-width: fit-content;
}

:deep(.ant-radio-button-wrapper) {
    white-space: nowrap;
    padding: 4px 15px;
}

:deep(.ant-radio-button-wrapper span) {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

/* 确保单选按钮组和按钮垂直居中对齐 */
:deep(.ant-radio-group) {
    display: inline-flex;
    align-items: center;
}

:deep(.ant-radio-button-wrapper) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    line-height: 32px;
}
</style>
