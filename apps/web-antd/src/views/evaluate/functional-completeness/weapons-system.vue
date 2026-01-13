<script setup lang="ts">
import {WeaponsSystem} from '@vben/common-ui'
import {deleteData, downloadTemplate, evaluateData, importData, list, upload} from "#/api";
import {message} from "ant-design-vue";
import {ref} from "vue";
// 数据列表
const datasource = ref([])
// 评估数据
const evaluateScore = ref(null)

// 加载数据数据
const handleLoadData = () => {
  list({extra: 'TX'}).then(res => {
    if (!res.data || !res.data['武器系统']) {
      message.info('暂无数据')
      datasource.value = []
      return
    }
    // 取最新的数据
    datasource.value = [res.data['武器系统']]
    message.success('数据加载成功')
  })
}

// 删除体系数据
const handleDeleteData = (value: any) => {
  deleteData({...value, extra: 'ZN'}).then(() => {
    handleLoadData()
  })
}
// 下载模版
const handleDownloadTemplate = async (value: any) => {
  await downloadTemplate(value)
}
// 文件上传
const handleSubmitUpload = (value: any) => {
  const {fd, extra} = value
  upload(fd).then(res => {
      if (res.code !== 200) {
        return false;
      }
      importData({
        filePath: res.path, extra, isStandard: '是',
        isPerformance: '否'
      }).then((res: any) => {
        message.success(res.msg)
        handleLoadData()
      })
    }
  )
}
// 评估
const handleEvaluateData = (data: any) => {
  evaluateData({interfaceList: data, extra: 'TX'}).then(res => {
    evaluateScore.value = res
  })
}
</script>

<template>
  <div class="w-full h-full p-5 ">
    <WeaponsSystem
      :datasource="datasource"
      :evaluate-score="evaluateScore"
      @update:loadData="handleLoadData"
      @update:deleteData="handleDeleteData"
      @update:downloadTemplate="handleDownloadTemplate"
      @update:upload="handleSubmitUpload"
      @update:evaluate="handleEvaluateData"/>
  </div>
</template>

<style scoped>

</style>

