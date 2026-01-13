<script setup lang="ts">
import {ref} from 'vue'
import {PerformanceAccuracy} from '@vben/common-ui'
import {list, deleteData, downloadTemplate, upload, importData} from '#/api'
import {message} from "ant-design-vue";
import {v4 as uuid} from "uuid";


// 数据列表
const datasource = ref([])

// 加载数据数据
const handleLoadData = () => {
  list({extra: 'XN'}).then(res => {
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
  deleteData({...value, extra: 'XN'}).then(res => {
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
      importData({filePath: res.path, extra: 'XN', isStandard: "是"}).then(res => {
        message.success(res.msg)
        handleLoadData()
      })
    }
  )
}
</script>

<template>
  <div class="w-full h-full p-5 overflow-y-hidden">
    <PerformanceAccuracy :datasource="datasource"
                         @update:loadData="handleLoadData"
                         @update:deleteData="handleDeleteData"
                         @update:downloadTemplate="handleDownloadTemplate"
                         @update:submitUpload="handleSubmitUpload"/>
  </div>
</template>

<style scoped>

</style>
