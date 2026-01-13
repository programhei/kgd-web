<script setup lang="ts">

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
// import {VbenButton} from '@vben/common-ui'
import '../index.css'
import original from '../../../../assets/images/original.png'
import dayjs from "dayjs";
// import {ViewXDDataModal} from './component'
import {message, type UploadChangeParam, type UploadProps} from "ant-design-vue";
import {computed, reactive, ref,h} from "vue";


const props = defineProps({
  datasource: [],
})
// 传递事件
const emit = defineEmits<{
  'update:submitUpload': [value: any],
  'update:downloadTemplate': [value: any],
  'update:loadData': [],
  'update:deleteData': [value: any],
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
// 定义数据表格列
const columns = ref([
  {
    title: '编号',
    dataIndex: 'key',
    key: 'key',
    width: 180,
    align: 'center',
    ellipsis: true,
  },
  {
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

</script>

<template>
  <div class="w-full h-full flex  flex-col gap-5">
    <div class="w-full h-full flex gap-5">
      <Card class="p-5 flex-center  w-[60%] relative">
        <div class="absolute top-5 left-5">
          <a-typography-text strong class="text-[17px]">
            权值数据：
          </a-typography-text>
          <div class="grid  gap-5  md:grid-cols-4 mt-2 ">
            <div
              class="flex gap-1 border shadow-md cursor-pointer  rounded-lg p-2 hover:shadow-xl transition-shadow duration-300 ">
              <a-typography-text strong class="text-[15px]">
                初始距离：
              </a-typography-text>
              <div class="flex gap-5">
                <a-statistic title="主观权值"
                             :precision="2"
                             class=""
                             :value="weightData.length>0?weightData[0].initialDistanceSWeight:0.00"/>
                <a-statistic title="客观权值"
                             :precision="2"
                             :value="weightData.length>0?weightData[0].initialDistanceOWeight:0.00"/>
              </div>
            </div>
            <div
              class="flex gap-1 border shadow-md cursor-pointer  rounded-lg p-2 hover:shadow-xl transition-shadow duration-300 ">
              <a-typography-text strong class="text-[15px]">
                初始挂载：
              </a-typography-text>
              <div class="flex gap-5">
                <a-statistic title="主观权值"
                             :precision="2"
                             class=""
                             :value="weightData.length>0?weightData[0].initialMountingSWeight:0.00"/>
                <a-statistic title="客观权值"
                             :precision="2"
                             :value="weightData.length>0?weightData[0].initialMountingOWeight:0.00"/>
              </div>
            </div>
            <div
              class="flex gap-1 border shadow-md cursor-pointer  rounded-lg p-2 hover:shadow-xl transition-shadow duration-300 ">
              <a-typography-text strong class="text-[15px]">
                目标友机数量：
              </a-typography-text>
              <div class="flex gap-5">
                <a-statistic title="主观权值"
                             :precision="2"
                             class=""
                             :value="weightData.length>0?weightData[0].mySWeight:0.00"/>
                <a-statistic title="客观权值"
                             :precision="2"
                             :value="weightData.length>0?weightData[0].myOWeight:0.00"/>
              </div>
            </div>
            <div
              class="flex gap-1 border shadow-md cursor-pointer  rounded-lg p-2 hover:shadow-xl transition-shadow duration-300 ">
              <a-typography-text strong class="text-[15px]">
                目标型号：
              </a-typography-text>
              <div class="flex gap-5">
                <a-statistic title="主观权值"
                             :precision="2"
                             class=""
                             :value="weightData.length>0?weightData[0].targetModelSWeight:0.00"/>
                <a-statistic title="客观权值"
                             :precision="2"
                             :value="weightData.length>0?weightData[0].targetModelOWeight:0.00"/>
              </div>
            </div>
            <div
              class="flex gap-1 border shadow-md cursor-pointer  rounded-lg p-2 hover:shadow-xl transition-shadow duration-300 ">
              <a-typography-text strong class="text-[15px]">
                初始任务：
              </a-typography-text>
              <div class="flex gap-5">
                <a-statistic title="主观权值"
                             :precision="2"
                             class=""
                             :value="weightData.length>0?weightData[0].initialTaskSWeight:0.00"/>
                <a-statistic title="客观权值"
                             :precision="2"
                             :value="weightData.length>0?weightData[0].initialTaskOWeight:0.00"/>
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
        <a-empty
          class="flex-center flex-col"
          v-if="evaluation_data.length ===0"
          :image="Empty"
          :image-style="{height: '100px'}">
          <template #description>
            <div>
              暂无评估结果数据，请选择右侧数据点击评估，对想定参数数据进行评估。
              <ArrowRightOutlined/>
            </div>
          </template>
        </a-empty>

      </Card>
      <Card class="h-full w-[40%]">
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
                          @click="handleDownloadTemplate('想定合理性评估数据Excel模板.xlsx')">
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
          <a-divider orientation="left">目标数量合理性</a-divider>
          <a-table
            :columns="columns"
            :row-selection="rowSelection"
            :data-source="datasource"
            :bordered="true"
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

          <a-divider orientation="left">目标类型合理性</a-divider>
          <a-table
            :columns="columns"
            :row-selection="rowSelection"
            :data-source="datasource"
            :bordered="true"
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
        <CardFooter class="w-full flex-center p-5 justify-center">
          <a-button class="w-1/3 h-2/3">
            <SendOutlined class="mr-2"/>
            评估
          </a-button>
        </CardFooter>
      </Card>
    </div>

<!--    <ViewXDDataModal v-if="opened"-->
<!--                     v-model:opened="opened"-->
<!--                     v-model:datasource="tableData"/>-->
  </div>

</template>

<style scoped>

</style>
