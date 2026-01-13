<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {Card, Button} from 'ant-design-vue';
import {selectWeightTree,countAvgWeightWithType} from '#/api';

const router = useRouter();

const loading = ref(false);
const tableData = ref<any[]>([]);
const expandedKeys = ref<(string | number)[]>([]);

const columns = [
  {title: '维度', dataIndex: 'name', key: 'name', width: 240, fixed: 'left'},
  {title: '主观权值', dataIndex: 'weightZg', key: 'weightZg', width: 140},
  {title: '客观权值', dataIndex: 'weightKg', key: 'weightKg', width: 140},
  {title: '综合权值', dataIndex: 'weightZh', key: 'weightZh', width: 140},
  {title: '层级', dataIndex: 'level', key: 'level', width: 100},
];

const pickWeight = (record: any, keys: string[]) => {
  for (const key of keys) {
    const val = record?.[key];
    if (val !== undefined && val !== null) return val;
  }
  return '-';
};

const levelPrefix = (level: number) => {
  if (level === 1) return '';
  if (level === 2) return '├─ ';
  if (level === 3) return '│ └─ ';
  return '│ └─ ';
};

const getLevelColor = (level: number) => {
  const colors: Record<number, string> = {1: 'blue', 2: 'green', 3: 'purple', 4: 'orange', 5: 'red'};
  return colors[level] || 'gray';
};

// 数值保留两位小数
const formatWeight = (val: any) => {
  if (val === null || val === undefined || val === '') return '-';
  const num = Number(val);
  if (Number.isNaN(num)) return val;
  return num.toFixed(2);
};

const handleExpand = (expanded: boolean, record: any) => {
  const keys = [...expandedKeys.value];
  if (expanded) {
    if (!keys.includes(record.id)) keys.push(record.id);
  } else {
    const idx = keys.indexOf(record.id);
    if (idx > -1) keys.splice(idx, 1);
  }
  expandedKeys.value = keys;
};

const loadData = () => {
  loading.value = true;
  countAvgWeightWithType()
    .then((res) => {
      tableData.value = res|| [];
    })
    .catch(() => {
    })
    .finally(() => {
      loading.value = false;
    });
  // selectWeightTree({type: 0})
  //   .then((res) => {
  //     tableData.value = res?.treeData?.data?.list || [];
  //   })
  //   .finally(() => {
  //     loading.value = false;
  //   });
};

const handleBack = () => {
  router.push('/weight-update');
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <Card class="w-full h-full border-0 rounded-none bg-transparent" bordered={false}>
    <div class="flex items-center justify-between mb-4">
      <div class="text-lg font-semibold">融合数据</div>
      <Button type="default" @click="handleBack">返回数据管理</Button>
    </div>
    <a-table
      :loading="loading"
      :columns="columns"
      :data-source="tableData"
      :row-key="(record) => record.id"
      :childrenColumnName="'children'"
      :expandedRowKeys="expandedKeys"
      @expand="handleExpand"
      :pagination="false"
      bordered
      :scroll="{ x: 'max-content', y: '70vh' }"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="['weightZg','weightKg','weightZh'].includes(column.dataIndex)">
          <span>{{ formatWeight(text) }}</span>
        </template>
        <template v-if="column.dataIndex === 'name'">
          <span>
            {{ levelPrefix(record.level) }}{{ text }}
          </span>
        </template>
        
        <template v-else-if="column.dataIndex === 'level'">
          <a-tag :color="getLevelColor(record.level)"> 层级 {{ text }} </a-tag>
        </template>
      </template>
    </a-table>
  </Card>
</template>

