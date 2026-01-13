<script setup lang="ts">
import {h, computed, ref, reactive, watch} from 'vue'
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
import {useUpload} from '../../../../hook/useUpload'
import {message} from "ant-design-vue";

const props = defineProps({
  datasource: [],
  evaluateScore: null
})
// 传递事件
const emit = defineEmits<{
  'update:upload': [value: any],
  'update:loadData': [],
  'update:deleteData': [value: any],
  'update:downloadTemplate': [value: any],
  'update:evaluate': [value: any],
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
  emit('update:upload', {fd, extra, dataType})
})
const Empty = ref(original)
// 权值设定模态框打开状态
const opened = ref(false)
// 上传AfSim数据气泡框
const afSim_visible = ref(false)
// 上传数据气泡框
const visible = ref(false)
// 表格的单元
const columns_missile = ref(
  [
    // {
    //   title: '序号',
    //   dataIndex: 'serialNumber',
    //   key: 'serialNumber',
    //   align: 'center',
    //   ellipsis: true,
    // },
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
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
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
  ]
)
const missile_datasource = computed(() => {
  return props.datasource?.[0]?.["导弹模型"] ?? []
})
// 表格的单元
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
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
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
  ]
)
const gun_datasource = computed(() => {
  return props.datasource?.[0]?.["航炮模型"] ?? []
})
// 表格的单元
const columns_arms_control = ref(
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
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
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
  ]
)
const arms_control_datasource = computed(() => {
  // 兼容旧字段名“武器接口”与“武器控制模型”
  const item = props.datasource?.[0] || {}
  return item["武器接口"] ?? item["武器控制模型"] ?? []
})
// 表格的单元
const columns_fire_control_radar = ref(
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
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
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
  ]
)
const fire_control_radar_datasource = computed(() => {
  return props.datasource?.[0]?.["火控雷达模型"] ?? []
})
// 下载模版
const handleDownloadTemplate = (value: any) => {
  emit('update:downloadTemplate', value)
}
// 加载数据
const handleLoadData = () => {
  emit('update:loadData')
}
//  评估数据
const handleEvaluateData = () => {
  if (!props.datasource || props.datasource.length === 0) {
    return message.info('暂无数据，无法评分')
  }
  emit('update:evaluate', props.datasource)
}

// 计算进度条
const circleRadius = 44; // 圆的半径
const circleCircumference = 2 * Math.PI * circleRadius; // 圆的周长 ≈ 276.48

// 计算进度条的 stroke-dasharray
const progressDashArray = computed(() => {
  if (!props.evaluateScore || !props.evaluateScore.score) {
    return `0 ${circleCircumference}`;
  }
  const score = Number(props.evaluateScore.score) || 0;
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
  if (!props.evaluateScore || !props.evaluateScore.score) {
    return 0;
  }
  // 直接返回接口返回的值，不进行格式化
  return props.evaluateScore.score ?? 0;
});
</script>

<template>
  <div class="w-full h-full flex flex-col gap-5">
    <div class="w-full h-full flex gap-5">
      <Card class="p-6 w-[60%] flex flex-col gap-6 h-full overflow-hidden" >
        <!-- 空状态 -->
        <a-empty
          class="flex-center flex-col flex-1"
          v-if="!evaluateScore"
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
        <div v-if="evaluateScore" class="flex flex-col gap-6 h-full overflow-y-auto">
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
                    v-if="evaluateScore && evaluateScore.score > 0"
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
          <!-- 接口参数缺省项和失分原因 -->
          <div class="flex items-start w-full gap-4">
            <div class="w-1/2">
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                <div class="text-[16px] font-bold dark:text-white mb-3 flex items-center gap-2">
                  <ExclamationOutlined class="text-orange-500"/>
                  接口参数缺省项
                </div>
                <div v-if="!evaluateScore.missingInterface || evaluateScore.missingInterface.length === 0" 
                     class="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                  <ExclamationOutlined class="text-4xl mb-2 opacity-50"/>
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
                  <ExclamationOutlined class="text-red-500"/>
                  失分原因
                </div>
                <div v-if="!evaluateScore.reason || evaluateScore.reason.length === 0" 
                     class="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                  <ExclamationOutlined class="text-4xl mb-2 opacity-50"/>
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
      <Card class="h-full w-[40%] flex flex-col">
        <CardContent class="flex flex-col gap-0 flex-1 overflow-hidden">
          <!-- 顶部操作区域 -->
          <div class="flex flex-col pt-4 pb-4 gap-3 border-b border-gray-200 dark:border-gray-700">
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
          </div>
          
          <!-- 操作区域 -->
          <div class="flex flex-col pt-4 pb-4 gap-3">
            <div class="flex items-center justify-start gap-2 flex-wrap">
              <a-popover v-model:open="afSim_visible" trigger="click" placement="bottom">
                <template #content>
                  <div class="flex flex-col">
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
                    <a-button @click="onSubmit('TX')" class="mt-3 w-full"
                              :loading="uploading"
                              :disabled="fileList?.length === 0">
                      {{ uploading ? '上传中' : '开始上传' }}
                    </a-button>
                  </div>
                </template>
                <a-button type="primary" :icon="h(UploadOutlined)" class="flex-shrink-0 whitespace-nowrap">上传AfSim数据</a-button>
              </a-popover>
              <a-popover v-model:open="visible" trigger="click" placement="bottom">
                <template #content>
                  <div class="flex flex-col">
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
                  </div>
                </template>
                <a-button type="primary" :icon="h(UploadOutlined)" class="flex-shrink-0 whitespace-nowrap">上传数据</a-button>
              </a-popover>
              <a-button type="link" :icon="h(DownloadOutlined)" size="small"
                        @click="handleDownloadTemplate('武器系统.xlsx')"
                        class="flex-shrink-0 whitespace-nowrap text-blue-500 hover:text-blue-600">
                下载Excel模版
              </a-button>
            </div>
          </div>
          <div class="w-full overflow-y-auto flex-1" style="max-height: calc(100vh - 300px);">
            <div class="space-y-4">
              <div>
                <a-divider orientation="left" class="!mb-3">
                  <span class="text-base font-semibold">导弹模型</span>
                </a-divider>
                <a-table
                  :columns="columns_missile"
                  :data-source="missile_datasource"
                  bordered
                  size="small"
                  :pagination="false"
                  class="rounded-lg overflow-hidden"
                >
                </a-table>
              </div>
              <div>
                <a-divider orientation="left" class="!mb-3">
                  <span class="text-base font-semibold">航炮模型</span>
                </a-divider>
                <a-table
                  :columns="columns_gun"
                  :data-source="gun_datasource"
                  bordered
                  size="small"
                  :pagination="false"
                  class="rounded-lg overflow-hidden"
                >
                </a-table>
              </div>
              <div>
                <a-divider orientation="left" class="!mb-3">
                  <span class="text-base font-semibold">武器控制模型</span>
                </a-divider>
                <a-table
                  :columns="columns_arms_control"
                  :data-source="arms_control_datasource"
                  bordered
                  size="small"
                  :pagination="false"
                  class="rounded-lg overflow-hidden"
                >
                </a-table>
              </div>
              <div>
                <a-divider orientation="left" class="!mb-3">
                  <span class="text-base font-semibold">火控雷达模型</span>
                </a-divider>
                <a-table
                  :columns="columns_fire_control_radar"
                  :data-source="fire_control_radar_datasource"
                  bordered
                  size="small"
                  :pagination="false"
                  class="rounded-lg overflow-hidden"
                >
                </a-table>
              </div>
            </div>
          </div>
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
