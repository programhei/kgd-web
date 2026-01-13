<script setup lang="ts">
import {computed, defineProps, reactive, ref, defineEmits, h, watch} from 'vue'
import {
  DeleteOutlined,
  UploadOutlined,
  SendOutlined,
  ArrowRightOutlined,
  EyeOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  InboxOutlined,
  ClearOutlined,
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
import {v4 as uuid} from "uuid";

import {ViewXNDataModal} from "../component";

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
// 数据详情
const tableData = ref([])
// 单元格
const columns = ref([
  {
    title: '数据ID',
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
const dd_datasource = computed(() => {
  // 统一成数组，避免下标 0 写死
  const dsArray = Array.isArray(props.datasource)
    ? props.datasource
    : [props.datasource];

  // 找到目标维度
  const target = dsArray
    .flatMap(ds => ds?.datasource1 ?? [])
    .find(v => v.dimension === '导弹弹道准确度');

  // 给 children 加 key
  return (target?.children ?? []).map(item => ({
    ...item,
    key: uuid(),
    dimension: '导弹弹道准确度'
  }));
});
const columns_engine = ref([
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

const missile_engine_datasource = computed(() => {
  const list =
    props.datasource?.[0]?.datasource1
      ?.find((v: any) => v.dimension === '导弹发动机模型准确度')
      ?.children ?? [];

  // 给每条数据注入 uuid（不污染原数组）
  return list.map((item: any) => ({...item, key: uuid(), dimension: '导弹发动机模型准确度'}));
});
const columns_missile_parameters = ref([
  {
    title: '武器杀伤半径',
    dataIndex: 'killingRange',
    key: 'killingRange',
    align: 'center',
    ellipsis: true,
  },
  {
    title: '导引头截获距离准确度',
    dataIndex: 'interceptDistance',
    key: 'interceptDistance',
    align: 'center',
    ellipsis: true,
  },
])
const missile_parameters_datasource = computed(() => {
  const list = props.datasource?.[0]?.datasource2;
  const target = list?.find(v => v.dataType === '导弹性能参数准确度');
  return target?.missileModelList ?? [].map(item => ({...item, key: uuid()}));
})
// 选择状态
const state = reactive({
  selectedRowKeys: [],
  selectedRow: null,
  selectedDDRowKeys: [],
  selectedDDRow: null,
  selectedFDJRowKeys: [],
  selectedFDJRow: null,
})
/* 单选配置 */
const rowSelection = computed(() => ({
  type: 'radio',
  selectedRowKeys: state.selectedRowKeys,
  onChange: (keys, rows) => {
    state.selectedRowKeys = keys.length ? [keys[keys.length - 1]] : []
    state.selectedRow = rows.length ? [rows[rows.length - 1]] : null
  }
}))
const ddRowSelection = computed(() => ({
  type: 'checkbox',
  selectedRowKeys: state.selectedDDRowKeys,
  onChange: (keys, rows) => {
    state.selectedDDRowKeys = keys.length ? keys : []
    state.selectedDDRow = rows.length ? rows : null
  }
}))
const engineRowSelection = computed(() => ({
  type: 'checkbox',
  selectedRowKeys: state.selectedFDJRowKeys,
  onChange: (keys, rows) => {
    state.selectedFDJRowKeys = keys.length ? keys : []
    state.selectedFDJRow = rows.length ? rows : null
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
  emit('update:loadData')
}

// 取消选择
const handleClearTableSelect = () => {
  state.selectedRowKeys = []
  state.selectedRow = null
  state.selectedDDRowKeys = []
  state.selectedDDRow = null
  state.selectedFDJRowKeys = []
  state.selectedFDJRow = null
}
// 表格删除
const handleDeleteRow = (value: any) => {
  emit('update:deleteData', value)
}
// 数据预览
const handleViewRow = (value: any) => {
  tableData.value = value.missileDataList ?? value.missileModelList
  opened.value = true
}
const handleEvaluate = () => {
  if (activeKey.value === '是') {
    // 标准数据模式：检查是否有数据
    if (!dd_datasource.value || dd_datasource.value.length === 0) {
      return message.warn("暂无评估数据")
    }
    emit("update:evaluate", {
      variable: '导弹仿真性能准确度',
      compareList: [],
      xnList: []
    })
  } else {
    // 比对数据模式：需要选择数据
  if (!state.selectedRow || state.selectedRow.length === 0) {
    return message.warn("请选择评估数据")
  }
  emit("update:evaluate", {
    variable: '导弹仿真性能准确度',
      compareList: [...(state.selectedFDJRow || []), ...(state.selectedDDRow || [])],
    xnList: [...state.selectedRow]
  })
  }
}
const handleDownloadTemplate = (value: any) => {
  emit('update:downloadTemplate', value)
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
      <Card class="h-full w-[40%]">
        <CardContent class="flex flex-col gap-0">
          <!-- 顶部操作区域 -->
          <div class="flex flex-col pt-4 pb-4 gap-3 border-b border-gray-200 dark:border-gray-700">
            <!-- 第一行：单选按钮组、加载数据、评估按钮 -->
            <div class="flex justify-between items-center gap-3">
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
                        @click="handleDownloadTemplate('导弹射程准确度.xlsx')"
                        class="flex-shrink-0 whitespace-nowrap text-blue-500 hover:text-blue-600">
                下载导弹射程模版
              </a-button>
              <a-button type="link" :icon="h(DownloadOutlined)" size="small"
                        @click="handleDownloadTemplate('发动机工作时间准确度.xlsx')"
                        class="flex-shrink-0 whitespace-nowrap text-blue-500 hover:text-blue-600">
                下载发动机工作时间模版
              </a-button>
            </div>
            </div>
            <a-divider orientation="left">导弹弹道准确度</a-divider>
            <a-table
              :columns="columns"
              :data-source="dd_datasource"
              :row-selection="activeKey ==='否'?ddRowSelection:null"
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
            <a-divider orientation="left">导弹发动机模型准确度</a-divider>
            <a-table
              :columns="columns_engine"
              :data-source="missile_engine_datasource"
              :row-selection="activeKey ==='否'?engineRowSelection:null"
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
          <!-- 导弹性能参数准确度操作区域 -->
          <div class="flex justify-start items-center pt-4 pb-2 gap-2 flex-wrap">
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
            <a-button :icon="h(CloseOutlined)" danger @click="handleClearTableSelect" class="flex-shrink-0 whitespace-nowrap">
                    取消选择
                  </a-button>
            <a-button type="link" :icon="h(DownloadOutlined)"
                      @click="handleDownloadTemplate('性能准确度导弹仿真.xlsx')"
                      class="flex-shrink-0 whitespace-nowrap text-blue-500 hover:text-blue-600">
                    下载性能准确度导弹仿真Excel模版
                  </a-button>
            </div>
            <a-divider orientation="left">导弹性能参数准确度</a-divider>
            <a-table
              :columns="columns_missile_parameters"
              :data-source="missile_parameters_datasource"
              :row-selection="rowSelection"
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
    display: inline-flex;
    align-items: center;
}

:deep(.ant-radio-button-wrapper) {
    white-space: nowrap;
    padding: 4px 15px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    line-height: 32px;
}

:deep(.ant-radio-button-wrapper span) {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
</style>
