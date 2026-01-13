<script setup lang="ts">
import {useVbenModal} from '@vben/common-ui'
import {watch, ref, computed} from "vue";
import {HistoryOutlined, InsertRowBelowOutlined} from "@ant-design/icons-vue";


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
// 表格头部标题映射
const headMap: Record<string, string> = {
  dataTitle: '数据ID',
  flightTime: '时间',
  flightSpeed: '速度',
  longitude: '经度',
  latitude: '纬度',
  headingAngle: '航向角',
  overload: '过载',
  height: '高度',
  testCount: '测试次数',
  discoveryDistance: '发现距离',
  x: 'X（北向位置）',
  y: 'Y（天向位置）',
  z: 'Z（东向位置）',
  enhancedState: '加力状态',
  trackTime: '时间',
  isStandard: "是否是标准数据"
}

// 需要过滤的 key 黑名单
const ignoreKeys = ref(['createBy', 'createTime', 'updateBy', 'updateTime', 'id', 'dataType', 'remark'])
// 表格列
const columns = computed(() => {
  return Object.keys(props.datasource.filter(item => item.dataType === radio.value)[0])
    .filter(key => !ignoreKeys.value.includes(key)).map(key => ({
      title: headMap[key],
      dataIndex: key,
      key,
      ellipsis: true,
      align: 'center'
    }));
});

// 数据详细列表
const tableData = computed(() => {
  return props.datasource.filter(item => item.dataType === radio.value)
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
  scaleModalApi.setState({title: '数据预览'})
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
