<script setup lang="ts">
import {computed, ref, reactive, h, watch} from 'vue'
import {
  Card,
  CardContent,
  CardFooter
} from '@vben-core/shadcn-ui';
import {
  FlagOutlined,
  SendOutlined,
  ArrowRightOutlined,
  UploadOutlined,
  EyeOutlined,
  DeleteOutlined,
  InboxOutlined,
  DownloadOutlined,
  PlusOutlined,
  CloseOutlined,
  FilterOutlined,
  ExclamationOutlined,
  StarOutlined
} from '@ant-design/icons-vue'
import './index.css'
import original from '../../../assets/images/original.png'
import {message, type UploadChangeParam, type UploadProps} from 'ant-design-vue'
import {ViewTXDataModal} from './component/index'
import dayjs from "dayjs";

// 传值类型
interface Props {
  /**
   * @zh_CN 数据列表
   */
  datasource: any,

  /**
   * @zh_CN 评估数据
   */
  evaluates: any,
}

//  默认值
const props = withDefaults(defineProps<Props>(), {
  datasource: [],
  evaluates: [],
})
// 传递事件
const emit = defineEmits<{
  'update:submitUpload': [value: any],
  'update:downloadTemplate': [value: any],
  'update:loadData': [value: any],
  'update:deleteData': [value: any],
  'update:evaluateData': [value: any],
}>()

// 空值图片
const Empty = ref(original)
// 上传的文件列表
const fileList = ref<UploadProps['fileList']>([]);
// 上传状态
const uploading = ref<boolean>(false);
// 上传标准数据气泡框
const visible = ref<boolean>(false);
// 上传比对数据气泡框
const compareVisible = ref<boolean>(false);
// 数据预览模态框打开状态
const opened = ref(false)
// 是否是标准数据
const activeKey = ref<string>('否')
// 数据详情
const tableData = ref([])
// 权值列表
const weights = computed(() => {
  if (props.evaluates.length > 0) {
    return props.evaluates[0].weights
  }
  return []

})
// 定义数据表格列
const columns = ref([
  {
    title: '编号',
    dataIndex: 'key',
    key: 'key',
    width: 180,
    align: 'center',
    ellipsis: true,
  }, {
    title: '数据ID',
    dataIndex: 'dataId',
    key: 'dataId',
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
// 选择状态
const state = reactive({
  selectedRowKeys: [],
  selectedRow: null
})


/* 单选配置 */
const rowSelection = computed(() => ({
  type: 'radio',
  selectedRowKeys: state.selectedRowKeys,
  onChange: (keys: any, rows: any) => {
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
  fileList.value?.forEach((file: UploadProps['fileList'][number]) => {
    formData.append('file', file as any);
  });
  uploading.value = true;
  emit('update:submitUpload', {formData, isStandard: activeKey.value})
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
function handleUploadDrop(e: DragEvent) {
  console.log(e);
}

// 加载数据
// 上传数据
const handleLoadData = () => {
  emit('update:loadData', activeKey.value)
}

// 取消选择
const handleClearTableSelect = () => {
  state.selectedRowKeys = []
  state.selectedRow = null
}
// 表格删除
const handleDeleteRow = (value: any) => {
  emit('update:deleteData', {...value, isStandard: activeKey.value})
}
// 数据预览
const handleViewRow = (value: any) => {
  tableData.value = value.dataList
  opened.value = true
}

/**
 * 评估
 */
const handleEvaluate = () => {
  if (!state.selectedRow || state.selectedRow.length === 0) {
    return message.warn("请选择评估数据")
  }
  emit("update:evaluateData", state.selectedRow.dataList)
}
watch(() => activeKey.value,
  (v) => {
    emit('update:loadData', activeKey.value)
    fileList.value = []
  }
)
</script>

<template>
  <div class="w-full h-full flex  flex-col gap-5">
    <div class="w-full h-full flex gap-5">
      <Card class="h-full p-5 flex-center relative w-[60%]">
        <div class="absolute top-2 left-5">
          <a-typography-text strong class="text-[17px]">
            权值数据：
          </a-typography-text>
          <div class="max-w-8xl mx-auto grid  gap-5  md:grid-cols-4 mt-2 ">
            <div
              class="flex gap-1 border shadow-md cursor-pointer  rounded-lg p-2 hover:shadow-xl transition-shadow duration-300 ">
              <a-typography-text strong class="text-[15px]">
                飞行模型颗粒度：
              </a-typography-text>
              <div class="flex gap-5">
                <a-statistic title="主观权值"
                             :precision="2"
                             class=""
                             :value="0.3"/>
                <a-statistic title="客观权值"
                             :precision="2"
                             :value="weights.length>0?weights[0]:0.00"/>
              </div>
            </div>
            <div
              class="flex gap-1 border shadow-md cursor-pointer  rounded-lg p-2 hover:shadow-xl transition-shadow duration-300 ">
              <a-typography-text strong class="text-[15px]">
                雷达模型颗粒度：
              </a-typography-text>
              <div class="flex gap-5">
                <a-statistic title="主观权值"
                             :precision="2"
                             class=""
                             :value="0.3"/>
                <a-statistic title="客观权值"
                             :precision="2"
                             :value="weights.length>0?weights[1]:0.00"/>
              </div>
            </div>
            <div
              class="flex gap-1 border shadow-md cursor-pointer  rounded-lg p-2 hover:shadow-xl transition-shadow duration-300 ">
              <a-typography-text strong class="text-[15px]">
                导弹模型颗粒度：
              </a-typography-text>
              <div class="flex gap-5">
                <a-statistic title="主观权值"
                             :precision="2"
                             class=""
                             :value="0.3"/>
                <a-statistic title="客观权值"
                             :precision="2"
                             :value="weights.length>0?weights[2]:0.00"/>
              </div>
            </div>
            <div
              class="flex gap-1 border shadow-md cursor-pointer  rounded-lg p-2 hover:shadow-xl transition-shadow duration-300 ">
              <a-typography-text strong class="text-[15px]">
                偏好系数：
              </a-typography-text>
              <div class="flex gap-5">
                <a-statistic title="系数k1"
                             :precision="2"
                             class=""
                             :value="evaluates.length !==0?evaluates[0].k1:0.0"/>
                <a-statistic title="系数k2"
                             :precision="2"
                             :value="evaluates.length !==0?evaluates[0].k2:0.0"/>
              </div>
            </div>
          </div>
        </div>
        <a-empty
          class="flex-center flex-col"
          v-if="evaluates.length ===0"
          :image="Empty"
          :image-style="{height: '100px'}">
          <template #description>
            <div>
              暂无评估结果，请选择右侧数据点击评估，对飞控、雷达、导弹数据进行评估。
              <ArrowRightOutlined/>
            </div>
          </template>
        </a-empty>
        <div v-if="evaluates.length !==0" class="flex flex-col gap-5">
          <div class="flex justify-center">
            <div class="relative w-40 h-40">
              <!-- 外层渐变圆环（进度条） -->
              <div class="absolute inset-0 rounded-full">
                <svg class="w-full h-full" viewBox="0 0 100 100">
                  <!-- 背景轨道 -->
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    :stroke="colorMode === 'light' ? '#f0f2f5' : '#1e293b'"
                    stroke-width="8"
                  />
                  <!-- 进度条（渐变） -->
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    stroke-width="8"
                    stroke-linecap="round"
                    :stroke-dasharray="`${70 * 2.7648} 276.48`"
                    transform="rotate(-90 50 50)"
                    class="transition-all duration-1000 ease-out"
                  />
                  <!-- 渐变定义 -->
                  <defs>
                    <linearGradient id="scoreGradient">
                      <stop offset="0%" :stop-color="'#3b82f6'"/>
                      <stop offset="100%" :stop-color="'#1d4ed8'"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <div class="text-5xl font-bold text-gray-800 dark:text-white">
                  {{ evaluates[0].score }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  总分数
                </div>
              </div>
            </div>
          </div>
          <div class="flex  gap-5  w-full ">
            <a-list class="w-1/2" size="small" :data-source="evaluates[0].scores">
              <template #renderItem="{ item }">
                <a-list-item>
                  {{ item.scoreType }}：{{ item.score }}
                </a-list-item>
              </template>
              <template #header>
                <div class="text-[16px] font-bold  dark:text-white">
                  <StarOutlined/>
                  得分项
                </div>
              </template>
            </a-list>
            <a-list class="w-1/2" size="small" :data-source="evaluates[0].reason.split('；')">
              <template #renderItem="{ item }">
                <a-list-item>{{ item }}</a-list-item>
              </template>
              <template #header>
                <div class="text-[16px] font-bold  dark:text-white">
                  <ExclamationOutlined/>
                  失分原因
                </div>
              </template>
            </a-list>
          </div>
        </div>
      </Card>
      <Card class="h-full w-[40%]">
        <CardContent class="flex flex-col">
          <div class="flex flex-col justify-end pt-4 pb-4 gap-5">
            <div class="flex  justify-between">
              <a-radio-group v-model:value="activeKey" button-style="solid">
                <a-radio-button value="否">
                  <div class="flex gap-2">
                    <FilterOutlined/>
                    比对数据
                  </div>
                </a-radio-button>
                <a-radio-button value="是">
                  <div class="flex gap-2">
                    <FlagOutlined/>
                    标准数据
                  </div>
                </a-radio-button>
              </a-radio-group>
              <a-button danger type="link" :icon="h(DownloadOutlined)"
                        @click="handleDownloadTemplate('体系功能评估数据Excel模板.xlsx')">
                下载Excel模版
              </a-button>
            </div>
            <div class="flex justify-end">
              <a-form layout="inline">
                <a-form-item v-if="activeKey ==='是'">
                  <a-popover v-model:open="visible" trigger="click" placement="bottom">
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
                        <a-button @click="handleUploadSubmit" class="mt-3 w-full"
                                  :loading="uploading"
                                  :disabled="fileList?.length === 0">
                          {{ uploading ? '上传中' : '开始上传' }}
                        </a-button>
                      </div>
                    </template>
                    <a-button type="primary" :icon="h(UploadOutlined)">上传标准数据</a-button>
                  </a-popover>
                </a-form-item>
                <a-form-item v-if="activeKey ==='否'">
                  <a-popover v-model:open="compareVisible" trigger="click" placement="bottom">
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
                        <a-button @click="handleUploadSubmit" class="mt-3 w-full"
                                  :loading="uploading"
                                  :disabled="fileList?.length === 0">
                          {{ uploading ? '上传中' : '开始上传' }}
                        </a-button>
                      </div>
                    </template>
                    <a-button type="primary" :icon="h(UploadOutlined)">上传比对数据</a-button>
                  </a-popover>
                </a-form-item>
                <a-form-item>
                  <a-button type="primary" :icon="h(PlusOutlined)" @click="handleLoadData">
                    加载数据
                  </a-button>
                </a-form-item>
                <a-form-item v-if="activeKey ==='否'">
                  <a-button :icon="h(CloseOutlined)" danger @click="handleClearTableSelect">
                    取消选择
                  </a-button>
                </a-form-item>
              </a-form>
            </div>
          </div>
          <a-table
            :columns="columns"
            :row-selection="activeKey ==='否'?rowSelection:null"
            :data-source="datasource"
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
        <CardFooter class="w-full flex-center p-5 justify-center ">
          <a-button type="primary" class="w-2/3" @click="handleEvaluate">
            <SendOutlined class="mr-2"/>
            评估
          </a-button>
        </CardFooter>
      </Card>
    </div>
    <ViewTXDataModal v-if="opened"
                     v-model:opened="opened"
                     v-model:datasource="tableData"
    />
  </div>
</template>

<style scoped>

</style>
