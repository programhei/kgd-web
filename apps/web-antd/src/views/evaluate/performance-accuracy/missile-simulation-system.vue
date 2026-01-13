<script setup lang="ts">
import {MissileSimulationSystem} from '@vben/common-ui'
import {ref} from "vue";
import {message} from "ant-design-vue";
import {
  upload,
  downloadTemplate,
  importData,
  list, deleteData, evaluateData, listWeight
} from '#/api'

const datasource = ref([])
// 评估数据
const evaluateScore = ref([])

// 加载数据数据
const handleLoadData = (value: any) => {
  datasource.value = []
  list({extra: 'MissileXN', isStandard: value}).then(res => {
    res.data.length === 0 ? message.info('暂无数据') : message.success('数据加载成功')
    datasource.value = res.data;
    console.log(res.data)
  })
}

// 删除体系数据
const handleDeleteData = (value) => {
  deleteData({...value, extra: 'RadarXN'}).then(res => {
    handleLoadData(value)
  })
}
// 下载模版
const handleDownloadTemplate = async (value: any) => {
  await downloadTemplate(value)
}
// 文件上传
const handleSubmitUpload = (value: any) => {
  const {formData, isStandard, isPerformance} = value
  upload(formData).then(res => {
      if (res.code !== 200) {
        return message.error('文件上传失败');
      }
      importData({filePath: res.path, extra: 'MissileXN', isStandard, isPerformance}).then(res => {
        handleLoadData(isStandard)
      })
    }
  )
}
const handleEvaluate = (value: any) => {
  const queryParams = {
    pageNum: 1,
    pageSize: 1000000,
    subjectiveWeight: null,
    objectiveWeight: null,
    dimension: null,
    variable: null,
    variableValue: null,
    coefficientK1: null,
    coefficientK2: null,
  }
  console.log(value)
  // 权值
  listWeight(queryParams).then(res => {
    evaluateData({
      ...value,
      weightList: res.rows,
      extra: "MissileXN"
    }).then(evaRes => {
      evaluateScore.value = [evaRes]
    })
  })
}
</script>

<template>
  <div class="w-full h-full p-5 ">
    <MissileSimulationSystem
      :datasource="datasource"
      :evaluateScore="evaluateScore"
      @update:loadData="handleLoadData"
      @update:deleteData="handleDeleteData"
      @update:downloadTemplate="handleDownloadTemplate"
      @update:submitUpload="handleSubmitUpload"
      @update:evaluate="handleEvaluate"
    />
  </div>
</template>

<style scoped>

</style>
