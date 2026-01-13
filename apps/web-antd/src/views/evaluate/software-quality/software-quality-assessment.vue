<script setup lang="ts">
import {SoftwareQualityAssessment} from '@vben/common-ui'
import {deleteData, downloadTemplate, evaluateData, evaluateSoftwareQuality, importData, list, upload} from "#/api";
import {message} from "ant-design-vue";
import {ref} from "vue";
import Reliability from "#/views/evaluate/software-quality/reliability.vue";
// 数据列表
const datasource = ref([])
// 评估数据
const evaluateScore = ref([])

// 加载数据数据
const handleLoadData = () => {
  list({extra: 'RJ'}).then(res => {
    res.data.length === 0 ? message.info('暂无数据') : message.success('数据加载成功')
    // 取最新的数据
    datasource.value = res.data[res.data.length - 1].dataList.map((item: any) => {
      return {
        ...item,
        key: uuid()
      }
    })
  })
}

// 删除体系数据
const handleDeleteData = (value: any) => {
  deleteData({...value, extra: 'RJ'}).then(() => {
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
      importData({filePath: res.path, extra: 'RJ'}).then((res: any) => {
        message.success(res.msg)
        handleLoadData()
      })
    }
  )
}
// 评估
const handleEvaluateData = (data: any) => {
  evaluateSoftwareQuality({compareList: data, extra: 'RJ'}).then(res => {
    evaluateScore.value = [res]
  })
}
</script>

<template>
  <div class="w-full h-full p-5 ">
    <SoftwareQualityAssessment
      :datasource="datasource"
      :evaluateScore="evaluateScore"
      @update:loadData="handleLoadData"
      @update:deleteData="handleDeleteData"
      @update:downloadTemplate="handleDownloadTemplate"
      @update:submitUpload="handleSubmitUpload"
      @update:evaluateData="handleEvaluateData"/>
  </div>
</template>

<style scoped>

</style>
