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

// 传递事件
const emit = defineEmits<{
  'update:opened': [value: boolean],
}>()

// 表格头部标题映射
const headMap: Record<string, string> = {
  dataTitle: '数据ID',
  myAircraftQuantity: '我方飞机数量',
  enemyAircraftQuantity: '敌方飞机数量',
  identification: '敌我标识',
  initialMyAircraft: '我方飞机初始化',
  initialEnemyAircraft: '敌方飞机初始化',
  aircraftGunsQuantity: '航炮数量',
  shortRangeMissilesQuantity: '近距导弹数量',
  mediumLongRangeMissilesQuantity: '中远距导弹数量',
  shortRangeCombat: '近距空战想定',
  mediumLongRangeCombat: '中远距空战想定',
  classificationRationality: '态势分类合理性',
  basicFormation: '基本编队',
  shortRangeFormation: '视距内空战编队',
  mediumRangeFormation: '中距空战编队',
  longRangeFormation: '远距空战编队'
}

// 需要过滤的 key 黑名单
const ignoreKeys = ref(['createBy', 'createTime', 'updateBy', 'updateTime', 'id', 'dataType', 'remark'])
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
