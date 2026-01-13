<script setup lang="ts">
import {ref} from 'vue'
import {SystemFunctions} from '@vben/common-ui'
import {v4 as uuid} from 'uuid'

import {
  upload,
  downloadTemplate, importData, list, deleteData, evaluateData, listWeight
} from '#/api'
import {message} from "ant-design-vue";

// 数据列表
const datasource = ref([])
// 评估数据
const evaluates = ref([])
// 加载数据数据
const handleLoadData = (value: any) => {
  list({extra: 'TX', isStandard: value}).then(res => {
    res.data.length === 0 ? message.info('暂无数据') : message.success('数据加载成功')
    datasource.value = res.data.map((item: any) => {
      return {
        ...item,
        key: uuid()
      }
    })
  })
}

// 删除体系数据
const handleDeleteData = (value: any) => {
  deleteData({...value, extra: 'TX'}).then(() => {
    handleLoadData(value.isStandard)
  })
}
// 下载模版
const handleDownloadTemplate = async (value: any) => {
  await downloadTemplate(value)
}
// 文件上传
const handleSubmitUpload = (value: any) => {
  const {formData, isStandard} = value
  upload(formData).then(res => {
      if (res.code !== 200) {
        return message.error('文件上传失败');
      }
      importData({filePath: res.path, extra: 'TX', isStandard}).then(res => {
        handleLoadData(isStandard)
      })
    }
  )
}
// 评估数据
const handleEvaluate = (value: any) => {
  const queryParams = {
    pageNum: 1,
    pageSize: 10,
    subjectiveWeight: null,
    objectiveWeight: null,
    dimension: null,
    variable: null,
    variableValue: null,
    coefficientK1: null,
    coefficientK2: null,
  }
  // 权值
  listWeight(queryParams).then(res => {
    evaluateData({
      weightList: res.rows,
      compareList: value,
      extra: "TX"
    }).then(evaRes => {
      evaluates.value = [evaRes]
    })
  })
}

</script>

<template>
  <div class="w-full p-5 h-full ">
    <SystemFunctions
      :datasource="datasource"
      :evaluates="evaluates"
      @update:loadData="handleLoadData"
      @update:deleteData="handleDeleteData"
      @update:downloadTemplate="handleDownloadTemplate"
      @update:submitUpload="handleSubmitUpload"
      @update:evaluateData="handleEvaluate"
    />
  </div>
</template>

<style scoped>

</style>
