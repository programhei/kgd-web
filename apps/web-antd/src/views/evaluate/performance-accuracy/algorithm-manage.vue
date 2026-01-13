<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue';
import { message, Modal } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import { listAlgorithm, addAlgorithm, updateAlgorithm, deleteAlgorithm } from '#/api/evaluate/algorithm';

interface AlgorithmRecord {
  id?: number;
  algorithmTitle: string;
  algorithmCode: string;
  algorithmType?: string;
  status?: string;
  sortOrder?: number;
  description?: string;
  testCaseDesc?: string;
  indicatorMethod?: string;
  formula?: string;
  targetValueDesc?: string;
  dataRequirements?: string;
  remark?: string;
}

const loading = ref(false);
const dataSource = ref<AlgorithmRecord[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const queryParams = reactive({
  algorithmTitle: '',
  status: '',
});

const statusOptions = [
  { label: '启用', value: '0' },
  { label: '停用', value: '1' },
];

const columns = [
  { title: '算法标题', dataIndex: 'algorithmTitle', key: 'algorithmTitle', ellipsis: true },
  { title: '算法代码', dataIndex: 'algorithmCode', key: 'algorithmCode', width: 160, ellipsis: true },
  { title: '算法类型', dataIndex: 'algorithmType', key: 'algorithmType', width: 140 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90 },
  { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 180 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' },
];

const modalVisible = ref(false);
const modalTitle = ref('新增算法');
const formRef = ref<FormInstance>();
const formState = reactive<AlgorithmRecord>({
  algorithmTitle: '',
  algorithmCode: '',
  algorithmType: '',
  status: '0',
  sortOrder: 0,
  description: '',
  testCaseDesc: '',
  indicatorMethod: '',
  formula: '',
  targetValueDesc: '',
  dataRequirements: '',
  remark: '',
});

const isEdit = computed(() => !!formState.id);

const resetFormState = () => {
  formState.id = undefined;
  formState.algorithmTitle = '';
  formState.algorithmCode = '';
  formState.algorithmType = '';
  formState.status = '0';
  formState.sortOrder = 0;
  formState.description = '';
  formState.testCaseDesc = '';
  formState.indicatorMethod = '';
  formState.formula = '';
  formState.targetValueDesc = '';
  formState.dataRequirements = '';
  formState.remark = '';
};

const fetchList = async () => {
  loading.value = true;
  try {
    const res: any = await listAlgorithm({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      ...queryParams,
    });
    const rows = res?.data?.rows || res?.rows || [];
    const total = res?.data?.total ?? res?.total ?? 0;
    dataSource.value = rows;
    pagination.total = total;
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (paginationInfo: any) => {
  pagination.current = paginationInfo.current;
  pagination.pageSize = paginationInfo.pageSize;
  fetchList();
};

const handleSearch = () => {
  pagination.current = 1;
  fetchList();
};

const handleReset = () => {
  queryParams.algorithmTitle = '';
  queryParams.status = '';
  handleSearch();
};

const openAddModal = () => {
  resetFormState();
  modalTitle.value = '新增算法';
  modalVisible.value = true;
  nextTickFocus();
};

const openEditModal = (record: AlgorithmRecord) => {
  resetFormState();
  Object.assign(formState, record);
  modalTitle.value = '编辑算法';
  modalVisible.value = true;
  nextTickFocus();
};

const nextTickFocus = () => {
  setTimeout(() => {
    if (formRef.value) {
      formRef.value.clearValidate();
    }
  }, 0);
};

const handleSubmit = () => {
  formRef.value?.validate().then(async () => {
    const payload = { ...formState };
    if (isEdit.value) {
      await updateAlgorithm(payload);
      message.success('更新成功');
    } else {
      await addAlgorithm(payload);
      message.success('新增成功');
    }
    modalVisible.value = false;
    fetchList();
  });
};

const handleDelete = (record: AlgorithmRecord) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除算法【${record.algorithmTitle}】吗？`,
    okText: '删除',
    okButtonProps: { danger: true },
    cancelText: '取消',
    async onOk() {
      await deleteAlgorithm(record.id!);
      message.success('删除成功');
      fetchList();
    },
  });
};

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div class="p-5 w-full h-full bg-gray-50 overflow-auto">
    <a-card title="算法查询" class="mb-4">
      <a-form :model="queryParams" layout="inline" class="space-x-4 flex flex-wrap">
        <a-form-item label="算法标题">
          <a-input v-model:value="queryParams.algorithmTitle" placeholder="请输入关键字" allow-clear />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="queryParams.status"
            style="width: 160px"
            allow-clear
            :options="statusOptions"
            placeholder="请选择状态"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button type="dashed" @click="openAddModal">新增算法</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card title="算法列表" :body-style="{ padding: 0 }">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        @change="handleTableChange"
        :scroll="{ x: 1000 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === '0' ? 'green' : 'red'">
              {{ record.status === '0' ? '启用' : '停用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openEditModal(record)">编辑</a-button>
              <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="720px"
      :maskClosable="false"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="formState" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              label="算法标题"
              name="algorithmTitle"
              :rules="[{ required: true, message: '请输入算法标题' }]"
            >
              <a-input v-model:value="formState.algorithmTitle" placeholder="请输入算法标题" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="算法代码"
              name="algorithmCode"
              :rules="[{ required: true, message: '请输入算法代码' }]"
            >
              <a-input v-model:value="formState.algorithmCode" placeholder="请输入唯一算法代码" :disabled="isEdit" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="算法类型">
              <a-input v-model:value="formState.algorithmType" placeholder="例如：相对误差" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态">
              <a-select v-model:value="formState.status" :options="statusOptions" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="排序">
              <a-input-number v-model:value="formState.sortOrder" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="目标值说明">
              <a-input v-model:value="formState.targetValueDesc" placeholder="例如：目标值 300/320" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="算法详情">
          <a-textarea v-model:value="formState.description" :rows="2" placeholder="请输入算法详情" />
        </a-form-item>
        <a-form-item label="测试用例描述">
          <a-textarea v-model:value="formState.testCaseDesc" :rows="3" placeholder="请输入测试用例描述" />
        </a-form-item>
        <a-form-item label="指标参数计算方法">
          <a-textarea v-model:value="formState.indicatorMethod" :rows="3" placeholder="请输入指标参数计算方法" />
        </a-form-item>
        <a-form-item label="计算公式">
          <a-textarea v-model:value="formState.formula" :rows="2" placeholder="请输入计算公式" />
        </a-form-item>
        <a-form-item label="数据要求">
          <a-textarea v-model:value="formState.dataRequirements" :rows="2" placeholder="请输入数据要求" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="formState.remark" :rows="2" placeholder="可填写补充说明" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

