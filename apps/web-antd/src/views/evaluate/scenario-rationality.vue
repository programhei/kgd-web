<script setup lang="ts">
import {ref} from 'vue'
import {v4 as uuid} from 'uuid'
import {ScenarioRationality} from '@vben/common-ui'
import {message} from "ant-design-vue";
import {
  list,
  deleteData,
  downloadTemplate, upload, importData, evaluateData
} from '#/api'

// 数据列表
const datasource = ref([])
const evaluateScore = ref([])

// 加载数据数据
const handleLoadData = () => {
  list({extra: 'XD'}).then(res => {
    res.data.length === 0 ? message.info('暂无数据') : message.success('数据加载成功')
    datasource.value = res.data.map(item => {
      return {
        ...item,
        key: uuid()
      }
    })
  })
}

// 删除体系数据
const handleDeleteData = (value) => {
  deleteData({...value, extra: 'XD'}).then(res => {
    handleLoadData()
  })
}
// 下载模版
const handleDownloadTemplate = async (value: any) => {
  await downloadTemplate(value)
}
// 文件上传
const handleSubmitUpload = (data: any) => {
  upload(data).then(res => {
      if (res.code !== 200) {
        return false;
      }
      importData({
        filePath: res.path, extra: 'XD', isStandard: "是",
        isPerformance: '否'
      }).then(res => {
        message.success(res.msg)
        handleLoadData()
      })
    }
  )
}
const handleEvaluate = (value) => {
  evaluateData({
    extra: "XD",
    compareList: value
  }).then(res => {
    evaluateScore.value = [res]
  })
}
</script>

<template>
  <div class="w-full h-full p-5 ">
    <ScenarioRationality :datasource="datasource"
                         :evaluate-score="evaluateScore"
                         @update:loadData="handleLoadData"
                         @update:deleteData="handleDeleteData"
                         @update:downloadTemplate="handleDownloadTemplate"
                         @update:submitUpload="handleSubmitUpload"
                         @update:evaluate="handleEvaluate"/>
  </div>
</template>

<style scoped>

</style>
