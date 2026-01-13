<script setup lang="ts">
import {computed, reactive, ref, toRaw, h, watch} from 'vue'
import {
  Card,
  CardContent,
  CardHeader,
} from '@vben-core/shadcn-ui';
import {
  DeleteOutlined,
  SearchOutlined,
  RetweetOutlined, ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import {Form, message, Modal} from 'ant-design-vue';

// 表单实例
const useForm = Form.useForm;
// 模态框
const [modal, contextHolder] = Modal.useModal();

// 传值类型
interface Props {
  /**
   * @zh_CN 数据列表
   */
  datasource: any,
  /**
   * @zh_CN 记录总数
   */
  total: number,
  /**
   * @zh_CN 操作类型
   */
  operationType: any,
}

//  默认值
const props = withDefaults(defineProps<Props>(), {
  datasource: [],
  total: 0,
  operationType: []
})
// 定义事件
const emit = defineEmits<{
  'update:radioValue': [value: string],
  'update:query': [value: any],
  'update:deleteLogs': [value: any],
  'update:cleanLogs': [value: any],
}>()

// 单选值
const radioValue = ref('opera-logs')
// 数据绑定
const modelRef = reactive({
  operIp: undefined,
  title: undefined,
  operName: undefined,
  businessType: undefined,
  status: undefined,
  ipaddr: undefined,
  userName: undefined,
});

// 操作类型
const operType = computed(() => {
  return props.operationType.map(item => {
    return {
      value: item.dictValue,
      label: item.dictLabel
    }
  })
})
// 单选监听事件
const handleRadioChange = (value) => {
  emit('update:radioValue', value.target.value)
}
// form表单
const {resetFields, validate, validateInfos} = useForm(modelRef);

// 定义操作日志表格列
const column = ref([
  {
    title: '日志编号',
    dataIndex: 'operId',
    key: 'operId',
    align: 'center'
  },
  {
    title: '系统模块',
    dataIndex: 'title',
    key: 'title',
    align: 'center'
  },
  {
    title: '操作类型',
    dataIndex: 'businessType',
    key: 'businessType',
    align: 'center'
  },
  {
    title: '操作人员',
    key: 'operName',
    dataIndex: 'operName',
    align: 'center'
  },
  {
    title: '操作地址',
    key: 'operIp',
    dataIndex: 'operIp',
    align: 'center'
  }, {
    title: '操作地点"',
    key: 'operLocation',
    dataIndex: 'operLocation',
    align: 'center'
  }, {
    title: '操作状态',
    key: 'status',
    dataIndex: 'status',
    align: 'center'
  }, {
    title: '操作日期',
    key: 'operTime',
    dataIndex: 'operTime',
    align: 'center'
  }, {
    title: '消耗时间',
    key: 'costTime',
    dataIndex: 'costTime',
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    align: 'center'
  },
])
// 定义登录日志表格列
const loginLogsColumn = ref([
  {
    title: '访问编号',
    dataIndex: 'infoId',
    key: 'infoId',
    align: 'center'
  },
  {
    title: '用户名称',
    dataIndex: 'userName',
    key: 'userName',
    align: 'center'
  },
  {
    title: '登录地址',
    dataIndex: 'ipaddr',
    key: 'ipaddr',
    align: 'center'
  }, {
    title: '登录地点',
    dataIndex: 'loginLocation',
    key: 'loginLocation',
    align: 'center'
  }, {
    title: '浏览器',
    dataIndex: 'browser',
    key: 'browser',
    align: 'center'
  }, {
    title: '操作系统',
    dataIndex: 'os',
    key: 'os',
    align: 'center'
  },
  {
    title: '登录状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center'
  }, {
    title: '操作信息',
    dataIndex: 'msg',
    key: 'msg',
    align: 'center'
  },
  {
    title: '登录日期',
    dataIndex: 'loginTime',
    key: 'loginTime',
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    width: 120
  },
])



// 分页状态
const pageConfig = computed(() => {
  return {
    current: 1,        // 当前页
    pageSize: 10,      // 每页条数
    total: props.total,          // 总条数（后端返回）
    showSizeChanger: true,  // 是否显示 pageSize 下拉
    showQuickJumper: true,  // 快速跳页
    showTotal: (total: number) => `共 ${total} 条`,
  }
})
// 选择key
type Key = string | number;
const state = reactive<{
  selectedRowKeys: Key[];
  loading: boolean;
}>({
  selectedRowKeys: [],
  loading: false,
});
// 表格选择
const handleTableSelectChange = (selectedRowKeys: Key[]) => {
  state.selectedRowKeys = selectedRowKeys;
};
// 页码或每页条数变化
const handleTableChange = (pag: { current: number; pageSize: number }) => {
  // 分页
  pageConfig.value.current = pag.current
  // 记录数
  pageConfig.value.pageSize = pag.pageSize
  // 查询
  handleDataSourceQuery()
}
// 删除操作日志
const handleDelOperationLog = (operId) => {
  if (!operId && state.selectedRowKeys.length === 0) {
    return message.warn("至少选一条记录进行删除")
  }
  modal.confirm({
    title: '提示',
    icon: h(ExclamationCircleOutlined),
    content: '是否删除操作日志',
    onOk() {
      emit('update:deleteLogs', {
          operIds: operId ? [operId] : state.selectedRowKeys.map(item => {
            return item
          })
        }
      )
    },
    onCancel() {
      message.info('用户取消操作')
    },
    class: 'test',
  });
}

// 删除登录日志
const handleDelLoginLog = (infoId) => {
  if (!infoId && state.selectedRowKeys.length === 0) {
    return message.warn("至少选一条记录进行删除")
  }
  modal.confirm({
    title: '提示',
    icon: h(ExclamationCircleOutlined),
    content: '是否删除登录日志',
    onOk() {
      emit('update:deleteLogs', {
          infoIds: infoId ? [infoId] : state.selectedRowKeys.map(item => {
            return item
          })
        }
      )
    },
    onCancel() {
      message.info('用户取消操作')
    },
    class: 'test',
  });
}

// 删除行记录
const handleRowDelete = (id) => {
  if (radioValue.value === 'opera-logs') {
    handleDelOperationLog(id)
  }
  if (radioValue.value === 'login-logs') {
    handleDelLoginLog(id)
  }
}

//查询
const handleDataSourceQuery = () => {
  if (radioValue.value === 'opera-logs') {
    emit('update:query', {
      ...toRaw(modelRef),
      radioValue: radioValue.value,
      pageNum: pageConfig.value.current,
      pageSize: pageConfig.value.pageSize
    })
  }
  if (radioValue.value === 'login-logs') {
    emit('update:query', {
      ...toRaw(modelRef),
      radioValue: radioValue.value,
      pageNum: pageConfig.value.current,
      pageSize: pageConfig.value.pageSize
    })
  }
}
// 重置
const handleRestQuery = () => {
  resetFields()
  if (radioValue.value === 'opera-logs') {
    emit('update:query', {...toRaw(modelRef), radioValue: radioValue.value})
  }
  if (radioValue.value === 'login-logs') {
    emit('update:query', {...toRaw(modelRef), radioValue: radioValue.value})
  }
}
// 数据格式化
const handleFormatter = (value) => {
  if (value['businessType'] && operType.value.filter(item => item.value === value['businessType'] + '')[0]){
    return operType.value.filter(item => item.value === value['businessType'] + '')[0].label
  }
  return ''

}
</script>

<template>
  <Card class="w-full h-full border-0  rounded-none bg-transparent">
    <CardHeader>
      <a-radio-group v-model:value="radioValue" button-style="solid" @change="handleRadioChange">
        <a-radio-button value="opera-logs">操作日志</a-radio-button>
        <a-radio-button value="login-logs">登录日志</a-radio-button>
      </a-radio-group>
    </CardHeader>
    <CardContent>
      <div class="flex flex-col gap-5" v-if="radioValue==='opera-logs'">
        <div class="flex justify-end">
          <a-form layout="inline">
            <a-form-item label="操作地址">
              <a-input
                v-model:value="modelRef.operIp"
                placeholder="请输入操作地址"
                allow-clear
              />
            </a-form-item>
            <a-form-item label="系统模块">
              <a-input
                v-model:value="modelRef.title"
                placeholder="请输入系统模块"
                allow-clear
                style="width: 240px;"
              />
            </a-form-item>
            <a-form-item label="操作人员">
              <a-input
                v-model:value="modelRef.operName"
                placeholder="请输入操作人员"
                allow-clear
                style="width: 240px;"
              />
            </a-form-item>
            <a-form-item label="类型">
              <a-select
                v-model:value="modelRef.businessType"
                placeholder="操作类型"
                clearable
                style="width: 240px"
              >
                <a-select-option
                  v-for="item in operType"
                  :value="item.value"
                >
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="状态">
              <a-select v-model:value="modelRef.status" style="width: 150px"
                        placeholder="请选择操作状态">
                <a-select-option :value="0">成功</a-select-option>
                <a-select-option :value="1">失败</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleDataSourceQuery">
                <SearchOutlined/>
                查询
              </a-button>
            </a-form-item>
            <a-form-item>
              <a-button type="default" @click="handleRestQuery">
                <RetweetOutlined/>
                重置
              </a-button>
            </a-form-item>

            <a-form-item>
              <a-button danger @click="handleDelOperationLog()">
                <DeleteOutlined/>
                删除
              </a-button>
            </a-form-item>
          </a-form>
        </div>
        <a-table
          :columns="column"
          :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: handleTableSelectChange }"
          :data-source="datasource"
          bordered
          :pagination="pageConfig"
          @change="handleTableChange"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'businessType'">
              <ATag color="#2db7f5">{{ handleFormatter(record) }}</ATag>
            </template>
            <template v-if="column.key === 'status'">
              <ATag v-if="record.status ===0" color="#108ee9">成功</ATag>
              <ATag v-if="record.status === 1" color="#f50">失败</ATag>
            </template>
            <template v-if="column.key === 'action'">
              <ASpace>
                <AButton type="link" danger size="small" @click="handleRowDelete(record.operId)">
                  <DeleteOutlined/>
                </AButton>
              </ASpace>
            </template>
          </template>
        </a-table>
      </div>
      <div class="flex flex-col gap-5" v-if="radioValue==='login-logs'">
        <div class="flex justify-end">
          <a-form layout="inline" :model="formState">
            <a-form-item label="登录地址" prop="ipaddr">
              <a-input
                v-model:value="modelRef.ipaddr"
                placeholder="请输入登录地址"
                allow-clear
              />
            </a-form-item>
            <a-form-item label="用户名称" prop="userName">
              <a-input
                v-model:value="modelRef.userName"
                placeholder="请输入用户名称"
                allow-clear
              />
            </a-form-item>
            <a-form-item label="状态" prop="status">
              <a-select v-model:value="modelRef.status" style="width: 150px"
                        placeholder="请选择操作状态">
                <a-select-option :value="0">成功</a-select-option>
                <a-select-option :value="1">失败</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleDataSourceQuery">
                <SearchOutlined/>
                查询
              </a-button>
            </a-form-item>
            <a-form-item>
              <a-button type="default" @click="handleRestQuery">
                <RetweetOutlined/>
                重置
              </a-button>
            </a-form-item>
            <a-form-item>
              <a-button danger @click="handleDelLoginLog()">
                <DeleteOutlined/>
                删除
              </a-button>
            </a-form-item>
          </a-form>
        </div>
        <a-table
          :columns="loginLogsColumn"
          :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: handleTableSelectChange }"
          :data-source="datasource"
          bordered
          size="small"
          :pagination="pageConfig"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <ATag v-if="record.status ==='0'" color="#108ee9">成功</ATag>
              <ATag v-if="record.status === '1'" color="#f50">失败</ATag>
            </template>
            <template v-if="column.key === 'action' && record.roleKey !=='admin'">
              <a-space>
                <a-button type="link" danger size="small" @click="handleRowDelete(record.infoId)">
                  <DeleteOutlined/>
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </CardContent>
    <contextHolder/>
  </Card>
</template>

<style scoped>

</style>
