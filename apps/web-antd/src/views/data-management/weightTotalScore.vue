<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { WeightTotalScore } from '@vben/common-ui';
  import { selectTotalScore,comprehensiveEvalua } from '#/api';
  import { message } from 'ant-design-vue';
  import { downloadEvaluationReport } from '#/api/common';
  
  // 数据列表
  const datasource = ref<any>({
    scenarioInfo: {
      combatMode: '中远距',
      initialSituation: '均势',
      redType: 'ZHZC',
      blueType: 'VISTA',
    },
    // 测试图片功能（可选）
    // redPlaneImg: '/images/red-plane.png',
    // bluePlaneImg: '/images/blue-plane.png',
    // battleImg: '/images/battle-scene.png',
  });
  
  // 记录总数
  const total = ref(76.73);
  
  // 维度树形数据
  const treeData = ref<any[]>([]);
  
  // 查询权值数据
  const handleLoadData = (pager: any) => {
    // selectTotalScore(pager)
    //   .then((res) => {
    //     if (res?.treeData?.data?.list) {
    //       treeData.value = res.treeData.data.list;
    //     }
    //     // 更新总分和场景信息
    //     if (res?.totalScore !== undefined) {
    //       total.value = res.totalScore;
    //     }
    //     if (res?.scenarioInfo) {
    //       datasource.value = {
    //         ...datasource.value,
    //         scenarioInfo: res.scenarioInfo,
    //       };
    //     }
    //   })
    //   .catch((error) => {
    //     console.error('查询权值数据失败:', error);
    //     message.error('查询权值数据失败');
    //   });

    comprehensiveEvalua().then((res:any) => {
      datasource.value = res
    })
  };
  
  // 初始化权值数据
  const handleInitWeightData = () => {
    // selectTotalScore({ groupId: 1 })
    //   .then((res) => {
    //     if (res?.treeData?.data?.list) {
    //       treeData.value = res.treeData.data.list;
    //     }
    //     // 更新总分和场景信息
    //     if (res?.totalScore !== undefined) {
    //       total.value = res.totalScore;
    //     }
    //     if (res?.scenarioInfo) {
    //       datasource.value = {
    //         ...datasource.value,
    //         scenarioInfo: res.scenarioInfo,
    //       };
    //     }
    //   })
    //   .catch((error) => {
    //     console.error('初始化权值数据失败:', error);
    //     // 使用测试数据
    //     console.log('使用测试数据');
    //   });
    comprehensiveEvalua().then((res:any) => {
      datasource.value = res
    })
  };
  
  // 生成评估报告
  const handleGenerateReport = async () => {
    try {
      await downloadEvaluationReport();
      message.success('评估报告模板下载成功');
    } catch (error) {
      message.error('评估报告模板下载失败');
      console.error('下载失败:', error);
    }
  };
  
  // 初始化加载
  onMounted(() => {
    // 初始化权值数据
    handleInitWeightData();
  });
  </script>
  
  <template>
    <div>
      <WeightTotalScore
        :datasource="datasource"
        :total="total"
        :tree-data="treeData"
        :group1="1"
        :group2="1"
        @update:loadData="handleLoadData"
        @update:generateReport="handleGenerateReport"
      />
    </div>
  </template>
  
  <style scoped>
  
  </style>
  