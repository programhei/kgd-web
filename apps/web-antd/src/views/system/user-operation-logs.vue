<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {getDictData, listOperaLogs, delOperaLog, listLoginLogs, delLoginLog} from '#/api'
import {UerOperationLogs} from '@vben/common-ui'
import {message} from "ant-design-vue";

// 字典值列表
const operationType = ref([])
// 数据源
const datasource = ref([])
// 记录总数
const total = ref(0)
// 查询参数
const queryParams = ref({
  operIp: undefined,
  title: undefined,
  operName: undefined,
  businessType: undefined,
  status: undefined,
  ipaddr: undefined,
  userName: undefined,
  pageSize: 10,
  pageNum: 1,
  total: 0
})
// 获取字典值
const handleGetDictData = () => {
  getDictData({dictType: 'sys_oper_type'}).then(res => {
    operationType.value = res.data
  })
}
// 获取操作日志数据
const handleInitDatasource = () => {
  listOperaLogs(queryParams.value).then(res => {
    datasource.value = res.rows
    total.value = res.total
  })
}
// 获取登录日志数据
const handleInitLoginLogsDatasource = () => {
  listLoginLogs(queryParams.value).then(res => {
    datasource.value = res.rows
    total.value = res.total
  })
}
// 单选值选择事件监听
const handleRadioChange = (value) => {
  console.log(value)
  // 操作日志
  if (value === 'opera-logs') {
    handleInitDatasource()
  }
  // 登录日志
  if (value === 'login-logs') {
    handleInitLoginLogsDatasource()
  }
}
// 查询
const handleQuery = (value) => {
  // 分页状态
  queryParams.value = {
    ...value
  }
  if (value.radioValue === 'opera-logs') {
    handleInitDatasource()
  }
  if (value.radioValue === 'login-logs') {
    handleInitLoginLogsDatasource()
  }
}
// 删除日志
const handleDeleteLogs = (value) => {
  if (value['operIds']) {
    delOperaLog({operId: value['operIds']}).then(res => {
      message.success(res.msg)
      handleInitDatasource()
    })
  }
  if (value['infoIds']) {
    delLoginLog({infoId: value['infoIds']}).then(res => {
      message.success(res.msg)
      handleInitLoginLogsDatasource()
    })
  }
}
// 清空日志
const handleCleanLogs = (value) => {
  console.log(value)
}
onMounted(() => {
  // 获取操作类型字典值
  handleGetDictData()
  //获取操作日志数据
  handleInitDatasource()
})

</script>

<template>
  <div>
    <UerOperationLogs
      :operation-type="operationType"
      :datasource="datasource"
      :total="total"
      @update:query="handleQuery"
      @update:radioValue="handleRadioChange"
      @update:deleteLogs="handleDeleteLogs"
      @update:cleanLogs="handleCleanLogs"
    />
  </div>
</template>

<style scoped>

</style>
