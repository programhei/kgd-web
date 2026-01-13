<script setup lang="ts">
  import { computed, ref, h, watch, onMounted, nextTick } from 'vue';
  
import { Card, CardContent, CardHeader } from '@vben-core/shadcn-ui';
  import { Modal } from 'ant-design-vue';
import { FileTextOutlined } from '@ant-design/icons-vue';
  import { EchartsUI, type EchartsUIType, useEcharts } from '@vben/plugins/echarts';

  import { weightGroup } from './data';
  
  let group = ref('1');
  
  interface Props {
    /**
     * @zh_CN 数据列表
     */
    datasource: any;
    /**
     * @zh_CN 数据总数
     */
    total: number;
    /**
     * @zh_CN 变量
     */
    treeData: any;
    /**
     * @zh_CN 红方数量
     */
    group1?: number;
    /**
     * @zh_CN 蓝方数量
     */
    group2?: number;
    /**
     * @zh_CN 默认空战模式
     */
    defaultCombatMode?: string;
    /**
     * @zh_CN 默认初始态势
     */
    defaultInitialSituation?: string;
    /**
     * @zh_CN 默认红方类型
     */
    defaultRedType?: string;
    /**
     * @zh_CN 默认蓝方类型
     */
    defaultBlueType?: string;
    /**
     * @zh_CN 红方飞机图片（可选，支持动态地址）
     */
    redPlaneImg?: string;
    /**
     * @zh_CN 蓝方飞机图片（可选，支持动态地址）
     */
    bluePlaneImg?: string;
    /**
     * @zh_CN 对抗场景中间整张图片（可选，支持动态地址）
     */
    battleImg?: string;
  }
  
  const props = defineProps<Props>();
  
  const emit = defineEmits<{
    'update:loadData': [value: any];
    'update:updateWeightTree': [value: any];
    'update:generateReport': [];
  }>();
  
  const [, contextHolder] = Modal.useModal();
  const radioValue = ref('sy');
  const expandedKeys = ref<string[]>([]);
  const tableHeight = 360;

  const tableData = computed(() => {
    const list = (props.datasource as any)?.dataList;
    return Array.isArray(list) ? list : [];
  });
  const totalScore = computed(() => {
    const total = props.total;
    if (total === null || total === undefined) return 0;
    return Number(total);
  });
  
  const scenarioInfo = computed(() => {
    const info = (props.datasource as any)?.scenarioInfo;
    if (info) {
      return [
        { label: '空战模式', value: info.combatMode || props.defaultCombatMode || '' },
        { label: '初始态势', value: info.initialSituation || props.defaultInitialSituation || '' },
        { label: '红方类型', value: info.redType || props.defaultRedType || '' },
        { label: '蓝方类型', value: info.blueType || props.defaultBlueType || '' },
];
    }
    // 如果没有 scenarioInfo，使用父组件传入的默认值
    return [
      { label: '空战模式', value: props.defaultCombatMode || '' },
      { label: '初始态势', value: props.defaultInitialSituation || '' },
      { label: '红方类型', value: props.defaultRedType || '' },
      { label: '蓝方类型', value: props.defaultBlueType || '' },
    ];
  });
  
  /**
   * 获取默认图片地址
   * @param imageName 图片文件名
   * @returns 图片地址
   */
  const getImageUrl = (imageName: string): string => {
    try {
      // 尝试从 assets 目录导入（Vite 会处理资源）
      return new URL(`../../../assets/images/${imageName}`, import.meta.url).href;
    } catch (error) {
      // 如果失败，尝试从 public 目录（绝对路径）
      // 注意：public 目录下的文件需要以 / 开头
      return `/images/${imageName}`;
    }
  };
  
  /**
   * 处理图片地址，支持多种格式和来源：
   * 优先级：datasource > props > 默认图片
   * 
   * 支持的图片格式：
   * - 完整 URL：http://、https://
   * - 绝对路径：/images/xxx.png
   * - 相对路径：./images/xxx.png 或 images/xxx.png
   * - 默认图片：从 assets 或 public 目录加载
   * 
   * @param imageKey 图片属性名（如 'redPlaneImg', 'bluePlaneImg', 'battleImg'）
   * @param defaultImageName 默认图片文件名
   * @returns 处理后的图片地址
   */
  const processImageSrc = (imageKey: string, defaultImageName: string): string => {
    const ds = props.datasource as any;
    
    // 1. 优先使用 datasource 中的图片（优先级最高）
    if (ds?.[imageKey] && typeof ds[imageKey] === 'string') {
      const src = ds[imageKey].trim();
      if (src) {
        // 如果是完整 URL 或绝对路径，直接返回
        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
          return src;
        }
        // 相对路径也直接返回，由浏览器处理
        return src;
      }
    }
    
    // 2. 其次使用 props 中的图片
    const propValue = (props as any)[imageKey];
    if (propValue && typeof propValue === 'string') {
      const src = propValue.trim();
      if (src) {
        // 如果是完整 URL 或绝对路径，直接返回
        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
          return src;
        }
        // 相对路径也直接返回
        return src;
      }
    }
    
    // 3. 最后使用默认图片
    return getImageUrl(defaultImageName);
  };
  
  /**
   * 红方飞机图片地址
   * 支持从 datasource.redPlaneImg、props.redPlaneImg 或默认图片加载
   */
  const redPlaneSrc = computed(() => {
    return processImageSrc('redPlaneImg', `plane-icon-${props.group1 ?? 1}.png`);
  });
  
  /**
   * 蓝方飞机图片地址
   * 支持从 datasource.bluePlaneImg、props.bluePlaneImg 或默认图片加载
   */
  const bluePlaneSrc = computed(() => {
    return processImageSrc('bluePlaneImg', `plane-icon-${props.group2 ?? 1}.png`);
  });
  
  /**
   * 对抗场景图片地址
   * 支持从 datasource.battleImg、props.battleImg 或默认图片加载
   */
  const battleImgSrc = computed(() => {
    return processImageSrc('battleImg', `plane-icon-${props.group1 ?? 1}.png`);
  });

const pieChartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(pieChartRef);

  // 饼图颜色：六种颜色，最后一个调整为粉紫色以区分
  const colorPalette = ['#3b82f6', '#f97316', '#9ca3af', '#eab308', '#06b6d4', '#a855f7'];
  
  const pieData = computed(() => {
    const data = tableData.value || [];
    
    return data
      .filter((item: any) => {
        // 排除"总和"等汇总行
        if (item?.dataKind === '总和' || item?.dataKind === '合计' || item?.dataKind === '总计') {
          return false;
        }
        
        // 如果有 level 字段，只显示第一层数据（level === 1），排除子节点
        if (item?.level !== undefined) {
          if (item.level !== 1) return false;
        }
        
        // 必须有有效的权重值
        if (item?.weight === undefined || item?.weight === null) {
          return false;
        }
        
        const weight = Number(item.weight);
        return !Number.isNaN(weight) && weight > 0;
      })
      .map((item: any, index: number) => {
        const rawWeight = Number(item.weight) || 0;
        return {
          name: item.dataKind ?? `维度${index + 1}`,
          value: rawWeight > 0 ? rawWeight : 0.001, // 用于占比，避免 0 被隐藏
          displayValue: rawWeight, // 显示用，不加 %
          color: colorPalette[index % colorPalette.length],
        };
      });
  });
  
  const formatPieValue = (val?: number) => {
    if (val === null || val === undefined || Number.isNaN(Number(val))) return '-';
    return Number(val).toFixed(2);
  };
  
  const pieOption:any = computed(() => ({
  tooltip: {
      trigger: 'item' as const,
      formatter: (params: any) => `${params.name}: ${formatPieValue(params.data?.displayValue)}`,
      textStyle: {
        fontSize: 14,
      },
    },
    legend: {
      orient: 'horizontal' as const,
      bottom: 0,
      data: pieData.value.map((item: any, index: number) => item.name),
      formatter: (name: string) => {
        const index = pieData.value.findIndex((item: any) => item.name === name);
        return index !== -1 ? `${index + 1}` : name;
      },
      textStyle: {
        fontSize: 16,
      },
      itemWidth: 16,
      itemHeight: 16,
      selectedMode: false as const,
  },
  series: [
    {
      type: 'pie',
        // 使用完整饼图（无内圈），稍微缩小以给标签留出空间
        radius: '68%',
        center: ['50%', '45%'],
      avoidLabelOverlap: true,
        minAngle: 0, // 确保即使很小的段也显示
        label: {
          show: true,
          formatter: (params: any) => `${params.name}: ${formatPieValue(params.data?.displayValue)}`,
          fontSize: 14,
          color: '#374151',
          position: 'outside', // 强制标签显示在外面
          // 确保所有标签都显示
          overflow: 'none', // 不隐藏溢出标签
          distanceToLabelLine: 5,
        },
        emphasis: {
      label: {
        show: true,
            fontSize: 18,
            fontWeight: 'bold',
          },
      },
      labelLine: {
        show: true,
          showAbove: false, // 引导线显示在饼图下方
          length: 20, // 第一段引导线长度（增加以给标签更多空间）
          length2: 30, // 第二段引导线长度（增加以给标签更多空间）
          smooth: 0.2, // 引导线平滑度
          lineStyle: {
            width: 1,
            type: 'solid',
          },
          // 确保所有引导线都显示，即使值很小
          minTurnAngle: 0,
      },
        data: pieData.value.map((item: any) => ({
          name: item.name,
        value: item.value,
          displayValue: item.displayValue,
        itemStyle: { color: item.color },
          label: {
            show: true, // 确保每个数据项都显示标签
            position: 'outside',
            formatter: (p: any) => `${p.name}: ${formatPieValue(p.data?.displayValue)}`,
          },
          labelLine: {
            show: true, // 确保每个数据项都显示引导线
            showAbove: false,
          },
      })),
    },
  ],
}));

  const columns = ref([
    {
      title: '维度',
      dataIndex: 'dataKind',
      key: 'dataKind',
      width: 220,
      fixed: 'left',
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      width: 140,
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      width: 140,
    },
  ]);
  
  function handleExpand(expanded: boolean, record: any) {
    const keys = [...expandedKeys.value];
    if (expanded) {
      if (!keys.includes(record.id)) {
        keys.push(record.id);
      }
    } else {
      const index = keys.indexOf(record.id);
      if (index > -1) {
        keys.splice(index, 1);
      }
    }
    expandedKeys.value = keys;
  }
  
  const handleLoadData = () => {
    emit('update:loadData', { groupId: group.value });
  };
  
  const handleResetData = () => {
    group.value = '1';
    emit('update:loadData', { groupId: group.value });
  };
  
  const handleGenerateReport = () => {
    emit('update:generateReport');
  };

  const formatWeight = (val?: number) => {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '-';
    return Number(val).toFixed(2);
};

const formatScore = (val?: number) => {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '--';
  return Number(val).toFixed(2);
};
  
  const renderPie = () => {
    if (!pieData.value.length) {
      // 如果没有数据，清空图表
      nextTick(() => {
        if (pieChartRef.value) {
          renderEcharts({ series: [{ type: 'pie', data: [] }] });
        }
      });
      return;
    }
    nextTick(() => renderEcharts(pieOption.value));
  };
  
  // 监听饼图数据变化，自动更新饼图
  // pieData 是 computed，会自动响应 tableData 的变化
  watch(
    pieData,
    () => {
      renderPie();
    },
    { deep: true }
  );
  
  // 同时监听 pieOption 的变化，确保配置更新时也能刷新
  watch(
    pieOption,
    () => {
      renderPie();
    },
    { deep: true }
  );
  
  onMounted(() => {
    handleLoadData();
    renderPie();
  });
</script>
<template>
  <Card class="w-full h-full border-0 rounded-none bg-transparent">
      <CardHeader> </CardHeader>
    <CardContent>
        <div v-if="radioValue === 'sy'" class="flex flex-col gap-6">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <a-button type="primary" :icon="h(FileTextOutlined)" @click="handleGenerateReport">
              评估报告
            </a-button>
            <div class="flex items-center gap-3 flex-wrap">
          <span class="text-sm text-gray-600">权值：</span>
              <a-select style="width: 220px" :options="weightGroup" v-model:value="group" placeholder="请选择权值组" />
              <a-button type="primary" @click="handleLoadData"> 总评估查询 </a-button>
              <a-button @click="handleResetData"> 重置 </a-button>
            </div>
        </div>

          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12 lg:col-span-8 flex flex-col gap-4">
              <a-table :columns="columns" :data-source="tableData" :row-key="(record: any) => record.id"
                :childrenColumnName="'children'" :expandedRowKeys="expandedKeys" @expand="handleExpand"
                :pagination="false" bordered :scroll="{ x: 'max-content' }" :sortable="false">
                <template #bodyCell="{ column, record, text }">
                  <template v-if="column.dataIndex === 'name'">
                    <span :class="`level-${record.level}`">
                      <span v-if="record.level === 1"></span>
                      <span v-else-if="record.level === 2">├─ </span>
                      <span v-else-if="record.level === 3">│ └─ </span>
                      <span v-else-if="record.level === 4">│ └─ </span>
                      {{ text }}
                    </span>
                  </template>
                  <template v-else-if="column.dataIndex === 'weight'">
                    <span>{{ formatWeight(text) }}</span>
                </template>
                <template v-else-if="column.dataIndex === 'score'">
                    <span>{{ formatScore(text) }}</span>
                </template>
              </template>
            </a-table>

              <div class="flex flex-col items-center justify-center gap-3 py-4 pie">
                <EchartsUI ref="pieChartRef" class="w-[420px] h-[340px]" />
              </div>
            </div>
  
            <div class="col-span-12 lg:col-span-4 bg-white">
              <div class="right-content rounded border shadow-sm flex flex-col h-full">
                <!-- 顶部：标题 + 得分框 -->
                <div class="flex items-start justify-between mb-8">
                  <div class="right-title flex items-center">{{ props.group1 ?? 1 }}V{{ props.group2 ?? 1 }}对抗场景</div>
                  <div class="border-[8px] border-blue-600 rounded px-8 py-4 flex flex-col items-center justify-center w-[220px]">
                    <div class="text-5xl font-bold leading-tight">
                      {{ formatScore(totalScore) }}
                    </div>
                    <div class="text-sm text-[#a6a6a6] mt-1">得分</div>
                </div>
              </div>

                <!-- 下方：左侧对抗图片 + 右侧场景信息 -->
                <div class="flex flex-1 gap-10">
                  <!-- 左侧：对抗场景图片（整张图） -->
                  <div class="flex items-center justify-center">
                    <div class="w-[220px] h-[320px] rounded-sm bg-white flex items-center justify-center">
                      <img :src="battleImgSrc" alt="对抗场景" class="max-w-full max-h-full object-contain" />
                </div>
              </div>

                  <!-- 右侧：场景信息列表 -->
                  <div class="flex-1 flex flex-col justify-center">
                    <div v-for="item in scenarioInfo" :key="item.label"
                      class="flex items-center justify-center border-b border-gray-200 py-5 text-lg text-gray-900">
                      <span>{{ item.label }}：</span>
                      <span>{{ item.value }}</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
      <contextHolder />
  </Card>
</template>

  <style scoped lang="scss">
  .pie {
    height: 340px !important;
  }
  
  .right-content {
    padding: 40px 50px;
}

  .right-title {
    font-size: 40px;
    font-weight: bold;
}
</style>
