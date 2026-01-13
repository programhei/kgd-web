<script setup lang="ts">
import {h, computed, ref, reactive, watch} from 'vue'
import {
  DatabaseOutlined,
  DownloadOutlined,
  InboxOutlined,
  UploadOutlined,
  ExclamationOutlined,
  QuestionOutlined
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
const {fileList, uploading, beforeUpload, onRemove, onUploadChange, onSubmit} = useUpload(fd => {
  emit('update:upload', fd)
})
const Empty = ref(original)
// 权值设定模态框打开状态
const opened = ref(false)
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
      title: '接口含义',
      dataIndex: 'interfaceMeaning',
      key: 'interfaceMeaning',
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
//  评估数据
const handleEvaluateData = () => {
  if (!props.datasource || props.datasource.length === 0) {
    return message.info('暂无数据，无法评分')
  }
  emit('update:evaluate', props.datasource)
}
</script>

<template>
  <div class="w-full h-full flex  flex-col gap-5">
    <div class="w-full h-full flex gap-5">
      <Card class="p-5 flex-center relative w-2/3">
        <!--        <div class="absolute top-5 left-5">-->
        <!--          <a-typography-text strong class="text-[17px]">-->
        <!--            权值数据：-->
        <!--          </a-typography-text>-->
        <!--          <div class="= grid  gap-5  md:grid-cols-4 mt-2 ">-->
        <!--            <div-->
        <!--              class="flex gap-1 border shadow-md cursor-pointer  rounded-lg p-2 hover:shadow-xl transition-shadow duration-300 ">-->
        <!--              <a-typography-text strong class="text-[15px]">-->
        <!--                输入接口：-->
        <!--              </a-typography-text>-->
        <!--              <div class="flex gap-5">-->
        <!--                <a-statistic title="权值"-->
        <!--                             :precision="2"-->
        <!--                             class=""-->
        <!--                             :value="weightData.length>0?weightData[0].inputInterfaceWeight:0.00"/>-->
        <!--              </div>-->
        <!--            </div>-->
        <!--            <div-->
        <!--              class="flex gap-1 border shadow-md cursor-pointer  rounded-lg p-2 hover:shadow-xl transition-shadow duration-300 ">-->
        <!--              <a-typography-text strong class="text-[15px]">-->
        <!--                输出接口：-->
        <!--              </a-typography-text>-->
        <!--              <div class="flex gap-5">-->
        <!--                <a-statistic title="权值"-->
        <!--                             :precision="2"-->
        <!--                             class=""-->
        <!--                             :value="weightData.length>0?weightData[0].outputInterfaceWeight:0.00"/>-->
        <!--              </div>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </div>-->

        <div class="absolute top-5 right-5 flex gap-1">
          <a-descriptions bordered>
            <a-descriptions-item label="评分规则" :span="3">
              1类数据为最重要数据，缺少大于两个数据，直接为0，缺少一个减少50分，数据格式不正确的，一个减少5分，减少到0为止；
              <br/>
              2类数据，缺少一个减5分，格式不正确减2分，减少到0为止。
            </a-descriptions-item>
            <a-descriptions-item label="数据格式" :span="3">
              格式不能兼容，比如用float的数据表达double的接口。
            </a-descriptions-item>
          </a-descriptions>
        </div>
        <a-empty
          class="flex-center flex-col"
          v-if="!evaluateScore"
          :image="Empty"
          :image-style="{height: '100px'}">
          <template #description>
            <div>
              暂无评估结果数据，请选择右侧数据点击评估，对智能决策模型接口进行评估。
              <ArrowRightOutlined/>
            </div>
          </template>
        </a-empty>
        <!-- 卡片内容：评分圆环 + 统计柱状图 -->
        <div v-if="evaluateScore" class="flex flex-col gap-5">
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
                  {{ evaluateScore.score }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  接口得分
                </div>
              </div>
            </div>
          </div>
          <div class="flex  items-end">
            <a-list size="small" :data-source="evaluateScore.reason.split('；')">
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
      <Card class="p-0 w-1/3">
        <CardContent class="flex flex-col gap-0">
          <div class="flex justify-end items-center pt-4  pb-4">
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
                    <a-button @click="onSubmit" class="mt-3 w-full"
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
                          @click="handleDownloadTemplate('支持智能决策模型生成与评估.xlsx')">
                  下载Excel模版
                </a-button>
              </a-form-item>
            </a-form>
          </div>
          <a-divider orientation="left">地形创建</a-divider>
          <a-table
            :columns="columns"
            :data-source="datasource"
            bordered
            size="small"
            :pagination="false"
          >
          </a-table>

          <a-divider orientation="left">视角设计</a-divider>
          <a-table
            :columns="columns"
            :data-source="datasource"
            bordered
            size="small"
            :pagination="false"
          >
          </a-table>
          <a-divider orientation="left">飞行轨迹视景显示</a-divider>
          <a-table
            :columns="columns"
            :data-source="datasource"
            bordered
            size="small"
            :pagination="false"
          >
          </a-table>
          <a-divider orientation="left">飞行姿态显示</a-divider>
          <a-table
            :columns="columns"
            :data-source="datasource"
            bordered
            size="small"
            :pagination="false"
          >
          </a-table>
        </CardContent>
        <CardFooter class="w-full flex-center p-5 justify-center ">
          <a-button type="primary" class="w-2/3" @click="handleEvaluateData">
            <SendOutlined class="mr-2"/>
            评估
          </a-button>
        </CardFooter>
      </Card>
    </div>
  </div>

</template>

<style scoped>

</style>
