<script setup lang="ts">
import {h, computed, ref, reactive} from 'vue'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@vben-core/shadcn-ui';
import {
  DatabaseOutlined,
  SendOutlined,
  FundViewOutlined
} from '@ant-design/icons-vue'
import {VbenButton} from '@vben/common-ui'
import './index.css'
import original from '../../../assets/images/original.png'

const props = defineProps({
  datasource: [],
})

const Empty = ref(original)

const headMap: Record<string, string> = {
  key: '编号',
  time: '时间',
  speed: '速度',
  long: '经度',
  lat: '纬度',
  heading_angle: '航向角',
  overload: '过载',
  height: '高度',
  test_count: '测试次数',
  discovery_distance: '发现距离',
  x_north: 'X（北向位置）',
  y_sky: 'Y（天向位置）',
  z_east: 'Z（东向位置）',
  enhanced_state: '加力状态'
}

type Key = string | number;
const state = reactive<{
  selectedRowKeys: Key[];
  loading: boolean;
}>({
  selectedRowKeys: [],
  loading: false,
});
const onSelectChange = (selectedRowKeys: Key[]) => {
  console.log('selectedRowKeys changed: ', selectedRowKeys);
  state.selectedRowKeys = selectedRowKeys;
};
// 评估数据
const evaluation_data = ref([])

</script>

<template>
  <div class="w-full h-full flex  flex-col gap-5">
    <div class="grid  gap-5  grid-cols-1 md:grid-cols-3  p-5  overflow-y-auto">
      <Card>
        <CardHeader class="flex-center card-header-themed rounded-t-lg">
          <CardTitle class="text-base">
            <DatabaseOutlined class="mr-1"/>
            体系功能评估数据
          </CardTitle>
        </CardHeader>
        <CardContent class="p-5">

        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex-center card-header-themed rounded-t-lg">
          <CardTitle class="text-base">
            <DatabaseOutlined class="mr-1"/>
            性能准确度评估数据
          </CardTitle>
        </CardHeader>
        <CardContent class="p-5">

        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex-center card-header-themed rounded-t-lg">
          <CardTitle class="text-base">
            <DatabaseOutlined class="mr-1"/>
            想定合理性评估数据
          </CardTitle>
        </CardHeader>
        <CardContent class="p-5">

        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex-center card-header-themed rounded-t-lg">
          <CardTitle class="text-base">
            <DatabaseOutlined class="mr-1"/>
            软件质量评估数据
          </CardTitle>
        </CardHeader>
        <CardContent class="p-5">

        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex-center card-header-themed rounded-t-lg">
          <CardTitle class="text-base">
            <DatabaseOutlined class="mr-1"/>
            智能决策模型生成与评估
          </CardTitle>
        </CardHeader>
        <CardContent class="p-5">

        </CardContent>
      </Card>
    </div>
    <div class="w-full h-20 flex-center  flex  gap-5">
      <VbenButton class="w-1/3 h-2/3 text-base">
        <SendOutlined class="mr-2"/>
        评估
      </VbenButton>
      <VbenButton class="w-1/3 h-2/3 text-base">
        <FundViewOutlined class="mr-2"/>
        查看评估结果
      </VbenButton>
    </div>
  </div>
</template>

<style scoped>

</style>
