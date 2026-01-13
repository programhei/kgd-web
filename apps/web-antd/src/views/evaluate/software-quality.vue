<script setup lang="ts">
import {ref} from 'vue'
import {v4 as uuid} from 'uuid'
import {SoftwareQuality} from '@vben/common-ui'
import {
  list,
  deleteData,
  downloadTemplate, upload, importData, listWeight, evaluateData
} from '#/api'
import {message} from "ant-design-vue";

// 数据列表
const datasource = ref([])
const evaluateScore = ref([])
// 加载数据数据
const handleLoadData = () => {
  list({extra: 'RJ'}).then(res => {
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
  deleteData({...value, extra: 'RJ'}).then(res => {
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
        filePath: res.path, extra: 'RJ', isStandard: "是",
        isPerformance: '否'
      }).then(res => {
        message.success(res.msg)
        handleLoadData()
      })
    }
  )
}
// 评估数据
const handleEvaluate = (value: any) => {
  evaluateData({
    extra: "RJ",
    compareList: value
  }).then(res => {
    evaluateScore.value = [res]
  })
}
</script>

<template>
  <div class="w-full h-full p-5 ">
    <SoftwareQuality :datasource="datasource"
                     :evaluateScore="evaluateScore"
                     @update:loadData="handleLoadData"
                     @update:deleteData="handleDeleteData"
                     @update:downloadTemplate="handleDownloadTemplate"
                     @update:submitUpload="handleSubmitUpload"
                     @update:evaluate="handleEvaluate"/>
  </div>
</template>

<style scoped>

</style>
