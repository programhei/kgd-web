<script setup lang="ts">
import {h, computed, ref, reactive} from 'vue'
import {
  ClearOutlined,
  DatabaseOutlined,
  DeleteOutlined, DownloadOutlined
  , EyeOutlined, InboxOutlined,
  UploadOutlined
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
// import {VbenButton} from '@vben/common-ui'
import '../index.css'
import original from '../../../../assets/images/original.png'
import {ViewRJDataModal} from '../component'


import dayjs from "dayjs";

// 传值类型
interface Props {
  /**
   * @zh_CN 数据列表
   */
  datasource: any,
  /**
   * @zh_CN 评估结果
   */
  evaluateScore: any[],
}

//  默认值
const props = withDefaults(defineProps<Props>(), {
  datasource: [],
  evaluateScore: () => [],
})
// 传递事件
const emit = defineEmits<{
  'update:submitUpload': [value: any],
  'update:downloadTemplate': [value: any],
  'update:loadData': [],
  'update:deleteData': [value: any],
  'update:evaluateData': [value: any],
}>()

// 空值图片
const Empty = ref(original)
// 上传的文件列表
const fileList = ref<UploadProps['fileList']>([]);
// 上传状态
const uploading = ref<boolean>(false);
// 上传数据气泡框
const visible = ref<boolean>(false);
// 数据预览模态框打开状态
const opened = ref(false)
// 评估数据
const evaluation_data = ref([])
// 权值数据
const weightData = computed(() => {
  return []
})
// 数据详情
const tableData = ref([])
// 定义数据表格列
const columns = ref([
  {
    title: '数据ID',
    dataIndex: 'dataId',
    key: 'dataId',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    width: 200,
  },
])
const columns_software_performance_efficiency = ref([
  {
    title: '时间响应特性',
    dataIndex: 'key',
    key: 'key',
    width: 180,
    align: 'center',
    ellipsis: true,
  }, {
    title: '资源利用率',
    dataIndex: 'dataId',
    key: 'dataId',
    align: 'center',
    ellipsis: true,
  },
])
const columns_maintainability = ref([
  {
    title: '代码注释率',
    dataIndex: 'key',
    key: 'key',
    width: 180,
    align: 'center',
    ellipsis: true,
  }, {
    title: '代码规范率',
    dataIndex: 'dataId',
    key: 'dataId',
    align: 'center',
    ellipsis: true,
  },
])
const columns_reliability = ref([
  {
    title: '连续运行时间',
    dataIndex: 'key',
    key: 'key',
    width: 180,
    align: 'center',
    ellipsis: true,
  }, {
    title: '接口容错率',
    dataIndex: 'dataId',
    key: 'dataId',
    align: 'center',
    ellipsis: true,
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

// 评估
const handleEvaluate = () => {
  if (!state.selectedRow) {
    return message.warn("请选择评估数据")
  }
  emit('update:evaluateData', state.selectedRow.dataList)
}
</script>

<template>
  <div class="w-full h-full flex  flex-col gap-5">
    <div class="w-full h-full flex gap-5">
      <Card class="p-5 flex-center relative w-2/3 ">
        <div class="absolute top-5 left-5">
          <a-typography-text strong class="text-[17px]">
            权值数据：
          </a-typography-text>
          <div class="max-w-6xl mx-auto grid  gap-5  md:grid-cols-4 mt-2 ">
            <div
              class="flex gap-1 border shadow-md cursor-pointer  rounded-lg p-2 hover:shadow-xl transition-shadow duration-300 ">
              <a-typography-text strong class="text-[15px]">
                性能效率：
              </a-typography-text>
              <div class="flex gap-5">
                <a-statistic title="主观权值"
                             :precision="2"
                             class=""
                             :value="weightData.length>0?weightData[0].peSWeight:0.00"/>
                <a-statistic title="客观权值"
                             :precision="2"
                             :value="weightData.length>0?weightData[0].peOWeight:0.00"/>
              </div>
            </div>
            <div
              class="flex gap-1 border shadow-md cursor-pointer  rounded-lg p-2 hover:shadow-xl transition-shadow duration-300 ">
              <a-typography-text strong class="text-[15px]">
                可移植性：
              </a-typography-text>
              <div class="flex gap-5">
                <a-statistic title="主观权值"
                             :precision="2"
                             class=""
                             :value="weightData.length>0?weightData[0].portabilitySWeight:0.00"/>
                <a-statistic title="客观权值"
                             :precision="2"
                             :value="weightData.length>0?weightData[0].portabilityOWeight:0.00"/>
              </div>
            </div>
            <div
              class="flex gap-1 border shadow-md cursor-pointer  rounded-lg p-2 hover:shadow-xl transition-shadow duration-300 ">
              <a-typography-text strong class="text-[15px]">
                可靠性：
              </a-typography-text>
              <div class="flex gap-5">
                <a-statistic title="主观权值"
                             :precision="2"
                             class=""
                             :value="weightData.length>0?weightData[0].reliabilitySWeight:0.00"/>
                <a-statistic title="客观权值"
                             :precision="2"
                             :value="weightData.length>0?weightData[0].reliabilityOWeight:0.00"/>
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
                             :value="weightData.length>0?weightData[0].coefficientK1:0.00"/>
                <a-statistic title="系数k2"
                             :precision="2"
                             :value="weightData.length>0?weightData[0].coefficientK2:0.00"/>
              </div>
            </div>
          </div>
        </div>
        <div v-if="evaluateScore && evaluateScore.length > 0" class="w-full h-full p-5 overflow-y-auto">
          <div class="mb-4">
            <a-typography-text strong class="text-[17px]">评估结果：</a-typography-text>
            <div class="mt-2">
              <a-typography-text strong class="text-[15px]">最终得分：</a-typography-text>
              <span class="text-2xl font-bold text-primary ml-2">{{ evaluateScore[0].score }}</span>
            </div>
          </div>
          <a-table
            :dataSource="evaluateScore[0].scores"
            :pagination="false"
            size="small"
            bordered
            rowKey="scoreType"
          >
            <a-table-column title="评估指标" dataIndex="scoreType" align="center"/>
            <a-table-column title="原始得分" dataIndex="score" align="center"/>
            <a-table-column title="权重" dataIndex="weight" align="center"/>
            <a-table-column title="加权得分" key="weightedScore" align="center">
              <template #default="{ record }">
                {{ (record.score * record.weight).toFixed(2) }}
              </template>
            </a-table-column>
          </a-table>
        </div>
        <a-empty
          class="flex-center flex-col"
          v-else
          :image="Empty"
          :image-style="{height: '100px'}">
          <template #description>
            <div>
              暂无评估结果数据，请选择右侧数据点击评估，对软件质量参数数据进行评估。
              <ArrowRightOutlined/>
            </div>
          </template>
        </a-empty>

      </Card>
      <Card class="h-full w-1/3 ">
        <CardContent class="flex flex-col gap-0">
          <div class="flex justify-end items-center pt-4  pb-4">
            <a-form layout="inline">
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
                <a-button type="default" :icon="h(DatabaseOutlined)" @click="handleLoadData">
                  加载数据
                </a-button>
              </a-form-item>
              <a-form-item>
                <a-button type="link" :icon="h(DownloadOutlined)"
                          @click="handleDownloadTemplate('软件质量评估数据Excel模板.xlsx')">
                  下载Excel模版
                </a-button>
              </a-form-item>
              <a-form-item>
                <a-button :icon="h(ClearOutlined)" @click="handleClearTableSelect">
                  取消选择
                </a-button>
              </a-form-item>
            </a-form>
          </div>
          <a-table
            :columns="columns"
            :row-selection="rowSelection"
            :data-source="datasource"
            bordered
            size="small">
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
          <a-divider orientation="left">软件性能效率</a-divider>
          <a-table
            :columns="columns_software_performance_efficiency"
            :data-source="datasource"
            bordered
            size="small"
            :pagination="false"
          >
          </a-table>
          <a-divider orientation="left">可维护性</a-divider>
          <a-table
            :columns="columns_maintainability"
            :data-source="datasource"
            bordered
            size="small"
            :pagination="false"
          >
          </a-table>
          <a-divider orientation="left">可靠性</a-divider>
          <a-table
            :columns="columns_reliability"
            :data-source="datasource"
            bordered
            size="small"
            :pagination="false"
          >
          </a-table>
        </CardContent>
        <CardFooter class="w-full flex-center p-5 justify-center">
          <a-button class="w-1/3 h-2/3" @click="handleEvaluate">
            <SendOutlined class="mr-2"/>
            评估
          </a-button>
        </CardFooter>
      </Card>
    </div>
    <ViewRJDataModal v-if="opened"
                     v-model:opened="opened"
                     v-model:datasource="tableData"
    />
  </div>

</template>

<style scoped>

</style>

