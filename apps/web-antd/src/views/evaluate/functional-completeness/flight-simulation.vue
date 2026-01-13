<script setup lang="ts">
import {FlightSimulation} from '@vben/common-ui'
import {deleteData, downloadTemplate, evaluateData, importData, list, upload} from "#/api";
import {message} from "ant-design-vue";
import {ref} from "vue";
// 数据列表
const datasource = ref<any[]>([])
// 评估数据
const evaluateScore = ref(null)

// 加载数据（同时获取飞行仿真与武器系统）
const handleLoadData = () => {
  list({extra: 'TX'}).then(res => {
    const data = res.data || {}
    const flight = data['飞行仿真'] || {}
    const weapon = data['武器系统'] || {}
    // 合并为一个对象，便于左右切换使用
    const merged = {...flight, ...weapon}
    datasource.value = [merged]
    if (!flight && !weapon) {
      return message.info('暂无数据')
    }
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
        filePath: res.path,
        extra,
        isStandard: '是',
        isPerformance: '否'
      }).then((res: any) => {
        message.success(res.msg)
        handleLoadData()
      })
    }
  )
}
// 评估：子组件传入 flight/weapon 独立数据，各调各的
const handleEvaluateData = (payload: any) => {
  const flightData = payload?.flight
  const weaponData = payload?.weapon

  const tasks: Promise<any>[] = []
  if (flightData) {
    tasks.push(evaluateData({interfaceList: flightData, extra: 'TX', scene: '飞行仿真'}))
  } else {
    tasks.push(Promise.resolve(null))
  }
  if (weaponData) {
    tasks.push(evaluateData({interfaceList: weaponData, extra: 'TX', scene: '武器系统'}))
  } else {
    tasks.push(Promise.resolve(null))
  }

  Promise.all(tasks).then(([flightRes, weaponRes]) => {
    evaluateScore.value = {
      flight: flightRes || {},
      weapon: weaponRes || {},
    }
  })
}
</script>

<template>
  <div class="w-full h-full flex flex-center ">
    <FlightSimulation
      v-model:datasource="datasource"
      v-model:evaluate-score="evaluateScore"
      @update:loadData="handleLoadData"
      @update:deleteData="handleDeleteData"
      @update:downloadTemplate="handleDownloadTemplate"
      @update:upload="handleSubmitUpload"
      @update:evaluate="handleEvaluateData"/>
  </div>
</template>

<style scoped>

</style>
