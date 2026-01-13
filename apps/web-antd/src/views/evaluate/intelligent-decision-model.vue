<script setup lang="ts">
import {ref} from 'vue'
import {v4 as uuid} from 'uuid'
import {IntelligentDecisionModel} from '@vben/common-ui'
import {
  list,
  deleteData,
  importData,
  downloadTemplate,
  upload,
  evaluateData,
  listIntelligentDecisions,
  listIntelligentDecision
} from '#/api'
import {message} from "ant-design-vue";

// 数据列表
const datasource = ref([])
// 评估数据
const evaluateScore = ref(null)
// 智能决策加载数据（多条）
const intelligentData = ref([])
// 智能决策单条数据
const intelligentDecisionData = ref([])

// 加载数据数据
const handleLoadData = () => {
  list({extra: 'ZN'}).then(res => {
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

// 加载智能决策数据（新接口）
const handleLoadIntelligentData = () => {
  listIntelligentDecisions().then((res: any) => {
    const rows = res || []
    if (!rows.length) {
      message.info('暂无数据')
    } else {
      message.success('数据加载成功')
    }
    intelligentData.value = rows.map((item: any, idx: number) => ({
      key: item.id || idx,
      ...item
    }))
  })
}

// 加载智能决策（单条接口）
const handleLoadIntelligentDecisionData = () => {
  listIntelligentDecision().then((res: any) => {
    const raw = res?.data || res || []
    const rows = Array.isArray(raw) ? raw : []
    if (!rows.length) {
      message.info('暂无数据')
    } else {
      message.success('数据加载成功')
    }
    // 展平 dataList，并带上 dataId 作为分组字段
    const flattened = rows.flatMap((group: any, gIdx: number) => {
      const list = group?.dataList || []
      return list.map((item: any, idx: number) => ({
        key: item.id || `${gIdx}-${idx}`,
        dataGroup: group?.dataId || '',
        ...item,
      }))
    })
    intelligentDecisionData.value = flattened
  })
}

// 删除体系数据
const handleDeleteData = (value: any) => {
  deleteData({...value, extra: 'ZN'}).then(() => {
    // handleLoadData()
  })
}
// 下载模版
const handleDownloadTemplate = async (value: any) => {
  await downloadTemplate(value)
}
// 文件上传
const handleSubmitUpload = ({ fd, extra }: { fd: FormData, extra: string }) => {
  upload(fd).then(res => {
      if (res.code !== 200) {
        return false;
      }
      importData({
        filePath: res.path, 
        extra: extra,
        isStandard: '是',
        isPerformance: '否'
      }).then((res: any) => {
        message.success(res.msg)
        // handleLoadData()
      })
    }
  )
}
// 评估
const handleEvaluateData = (data: any) => {
  evaluateData({extra: 'EZN'}).then(res => {
    evaluateScore.value = res
    console.log('evaluateScore', evaluateScore.value);
  })
}
</script>

<template>
  <div class="w-full h-full p-5 ">
    <IntelligentDecisionModel :datasource="datasource"
                              :evaluate-score="evaluateScore"
                              :intelligent-data="intelligentData"
                              :intelligent-decision-data="intelligentDecisionData"
                              @update:loadData="handleLoadData"
                              @update:loadIntelligent="handleLoadIntelligentData"
                              @update:loadIntelligentDecision="handleLoadIntelligentDecisionData"
                              @update:deleteData="handleDeleteData"
                              @update:downloadTemplate="handleDownloadTemplate"
                              @update:upload="handleSubmitUpload($event, 'ZN')"
                              @update:evaluate="handleEvaluateData"

    />
  </div>
</template>

<style scoped>

</style>
