<script setup lang="ts">
import {useVbenModal} from '@vben/common-ui'
import {watch, ref, computed} from "vue";
import {HistoryOutlined, InsertRowBelowOutlined, SettingOutlined} from "@ant-design/icons-vue";


interface Props {
  /**
   * @zh_CN 模态框状态
   */
  opened: boolean,
  /**
   * @zh_CN 数据ID
   */
  datasource: any,
}

//  默认值
const props = withDefaults(defineProps<Props>(), {
  opened: false,
  datasource: [],
})
// 飞行、雷达和导弹单选框值
const radio = ref('flight')
// 传递事件
const emit = defineEmits<{
  'update:opened': [value: boolean],
}>()
console.log(props.datasource)

// 表格头部标题映射
const headMap: Record<string, string> = {
  dataTitle: '数据ID',
  maximumSpeed: "最大速度",
  acceleration: '加速度',
  fuelRate: '耗油率',
  maximumOverload: '最大过载',
  detectionRange: '探测距离（5㎡目标）',
  azimuthDetectionRange: '探测范围（方位，度）',
  missileRange: '射程（11km高度，km）',
  interceptDistance: '导引头截获距离（km）',
  killingRange: "杀伤范围",
  engineRunningTime: '发动机运行时间（秒）',
  shootScope: '范围（标准为N）',
  shootRange: '射程（标准为N）',
  fuelConsumption: '油耗',
  specificFuelConsumption: '发动机耗油率',
  flightTime: '时间',
  flightSpeed: '速度',
  longitude: '经度',
  latitude: '纬度',
  headingAngle: '航向角',
  overload: '过载',
  height: '高度',
  testCount: '测试次数',
  discoveryDistance: '最大跟踪目标数量',
  x: '弹道准确度',
  y: '发动机工作时间准确度',
  z: '导弹射程准确度',
  enhancedState: '加力状态',
  trackTime: '最大跟踪外推时间',
  isStandard: "是否是标准数据"
}

// 需要过滤的 key 黑名单
const ignoreKeys = ref(['createBy', 'createTime', 'updateBy', 'updateTime', 'id', 'dataType', 'remark', "dataTitle", "isStandard", "dimension", 'testCount'])
// 表格列
const columns = computed(() => {
  return Object.keys(props.datasource[0]).filter(key => !ignoreKeys.value.includes(key)).map(key => ({
    title: headMap[key],
    dataIndex: key,
    key,
    ellipsis: true,
    align: 'center'
  }));
});

// 数据详细列表
const tableData = computed(() => {
  return props.datasource
})


// 使用modal的Api
const [ScaleModal, scaleModalApi] = useVbenModal({
  animationType: 'scale',
  draggable: true,
  fullscreen: false,
  fullscreenButton: false,
  showConfirmButton: false,
  cancelText: "关闭",
  contentClass: 'flex  flex-col gap-5  ',
  onCancel() {
    emit('update:opened', false)
  },
  onClosed() {
    emit('update:opened', false)
  }
});

const handleInitModal = (v) => {
  v ? scaleModalApi.open() : scaleModalApi.close()
  scaleModalApi.setState({title: props.datasource[0]["dataType"] + '数据预览'})
}


watch(
  () => props.opened,
  (v) => (
    handleInitModal(v)
  ),
  {immediate: true}
)

</script>

<template>
  <div class="space-y-4">
    <ScaleModal class="w-[90%] bg-background-deep">
      <!--      <div class="w-full flex justify-start">
              <a-radio-group v-model:value="radio" :style="{ marginBottom: '8px' }">
                <a-radio-button value="flight">
                  <InsertRowBelowOutlined/>
                  飞行参数
                </a-radio-button>
                <a-radio-button value="radar">
                  <InsertRowBelowOutlined/>
                  雷达参数
                </a-radio-button>
                <a-radio-button value="missile">
                  <InsertRowBelowOutlined/>
                  导弹参数
                </a-radio-button>
                <a-radio-button value="gun">
                  <InsertRowBelowOutlined/>
                  航炮参数
                </a-radio-button>
              </a-radio-group>
            </div>-->
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="false"
        :scroll="{ y: 640 }"
        :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)">
      </a-table>
    </ScaleModal>
  </div>
</template>

<style scoped>

</style>
