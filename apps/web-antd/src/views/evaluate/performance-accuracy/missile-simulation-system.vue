<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { message, Table, Space } from 'ant-design-vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import type { UploadFile, TableColumnsType } from 'ant-design-vue';
import { getMissileTrajectory, uploadMissileTrajectory } from '#/api/datasource/weight';
import { upload } from '#/api/common';
import { echarts as echartsLib } from '@vben/plugins/echarts';
// @ts-ignore - echarts-gl 没有类型声明文件
import 'echarts-gl';

const trajectoryData = ref<any[]>([]);
const trajectoryData0 = ref<any[]>([]);
const trajectoryData1 = ref<any[]>([]);
const fileList = ref<UploadFile[]>([]);
const loading = ref(false);
const tableLoading = ref(false);
const currentTime = ref(0);
const maxTime = ref(0);
const isPlaying = ref(false);
const selectedDataType = ref<'0' | '1'>('0'); // 0: 标准数据, 1: 测试数据
let animationInterval: number | null = null;

// 导弹性能参数准确度表格数据
const performanceAccuracyData = ref([
  {
    key: '1',
    element: '武器杀伤半径',
    standardValue: '',
    testValue: '',
    score: '',
  },
  {
    key: '2',
    element: '引导头截获距离',
    standardValue: '',
    testValue: '',
    score: '',
  },
]);

// 导弹性能参数准确度表格列定义
const performanceAccuracyColumns: TableColumnsType = [
  {
    title: '评估要素',
    dataIndex: 'element',
    key: 'element',
    align: 'center',
  },
  {
    title: '标准值',
    dataIndex: 'standardValue',
    key: 'standardValue',
    align: 'center',
  },
  {
    title: '测试值',
    dataIndex: 'testValue',
    key: 'testValue',
    align: 'center',
  },
  {
    title: '得分',
    dataIndex: 'score',
    key: 'score',
    align: 'center',
  },
];

// 表格列定义
const columns: TableColumnsType = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 80,
    customRender: ({ index }: { index: number }) => index + 1,
  },
  {
    title: '时间(s)',
    dataIndex: 'time',
    key: 'time',
    width: 100,
  },
  {
    title: '经度',
    dataIndex: 'longitude',
    key: 'longitude',
    width: 120,
  },
  {
    title: '纬度',
    dataIndex: 'latitude',
    key: 'latitude',
    width: 120,
  },
  {
    title: '高度(m)',
    dataIndex: 'altitude',
    key: 'altitude',
    width: 120,
  },
];

const chartRef = ref<HTMLElement | null>(null);
let chartInstance: ReturnType<typeof echartsLib.init> | null = null;

const processData = (data: any[], time?: number) => {
  if (!data || !Array.isArray(data) || data.length === 0) return [];
  
  const filteredData = time !== undefined 
    ? data.filter(item => Number(item?.time || 0) <= time)
    : data;
  
  return filteredData
    .filter(item => {
      const lon = Number(item?.longitude);
      const lat = Number(item?.latitude);
      const alt = Number(item?.altitude);
      return !isNaN(lon) && isFinite(lon) && !isNaN(lat) && isFinite(lat) && !isNaN(alt) && isFinite(alt);
    })
    .map(item => [Number(item.longitude), Number(item.latitude), Number(item.altitude)]);
};

const getCurrentHeight = (time: number) => {
  const data0 = trajectoryData0.value.filter(item => Number(item?.time || 0) <= time);
  const data1 = trajectoryData1.value.filter(item => Number(item?.time || 0) <= time);
  const heights: number[] = [];
  
  if (data0.length > 0 && data0[data0.length - 1]?.altitude !== undefined) {
    heights.push(Number(data0[data0.length - 1].altitude));
  }
  if (data1.length > 0 && data1[data1.length - 1]?.altitude !== undefined) {
    heights.push(Number(data1[data1.length - 1].altitude));
  }
  
  return heights.length > 0 ? Math.max(...heights) : 0;
};

const updateChart = (data0: any[], data1?: any[], time?: number) => {
  if (!chartInstance) return;

  const chartData0 = processData(data0, time);
  const chartData1 = data1 ? processData(data1, time) : [];
  const allChartData = [...chartData0, ...chartData1];
  
  if (chartData0.length === 0 && chartData1.length === 0) {
    const emptyOption = {
    title: {
      text: '弹道精准度三维图表',
      // subtext: '等待数据加载...',
      left: 'center',
      top: 10,
    },
    xAxis3D: {
      type: 'value',
      name: '经度',
    },
    yAxis3D: {
      type: 'value',
      name: '纬度',
    },
    zAxis3D: {
      type: 'value',
      name: '高度',
    },
      grid3D: {
        boxWidth: 54,
        boxDepth: 54,
        boxHeight: 54,
        viewControl: { 
          projection: 'perspective', 
          autoRotate: true, 
          autoRotateSpeed: 10,
          distance: 100
        },
        light: { main: { intensity: 1.2, shadow: true }, ambient: { intensity: 0.3 } },
    },
    series: [],
  };
    chartInstance.setOption(emptyOption);
    return;
  }
  
  const altitudes = allChartData.map(p => p[2] ?? 0).filter(v => isFinite(v));
  const minAlt = altitudes.length > 0 ? Math.min(...altitudes) : 0;
  const maxAlt = altitudes.length > 0 ? Math.max(...altitudes) : 0;

  try {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params && params.value && Array.isArray(params.value)) {
            const [lon, lat, alt] = params.value;
            const seriesIndex = params.seriesIndex;
            const dataIndex = params.dataIndex;
            const sourceData = seriesIndex === 0 ? data0 : data1;
            const item = sourceData?.[dataIndex];
            
            if (item) {
            return `
                <div style="padding: 10px;">
                  <div style="margin-bottom: 6px; font-size: 14px;"><strong>轨迹${seriesIndex}</strong></div>
                  <div style="margin-bottom: 6px; font-size: 14px;"><strong>时间:</strong> ${item.time?.toFixed(2) || 'N/A'}s</div>
                  <div style="margin-bottom: 6px; font-size: 14px;"><strong>经度(X轴):</strong> ${lon?.toFixed(6) || 'N/A'}°</div>
                  <div style="margin-bottom: 6px; font-size: 14px;"><strong>纬度(Y轴):</strong> ${lat?.toFixed(6) || 'N/A'}°</div>
                  <div style="font-size: 14px;"><strong>高度(Z轴):</strong> ${alt?.toFixed(0) || 'N/A'}m</div>
              </div>
            `;
          }
        }
        return '';
      },
    },
      visualMap: {
        show: true,
        dimension: 2,
        min: minAlt,
        max: maxAlt,
        inRange: {
          color: ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#0000ff']
        },
        outOfRange: {
          color: ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#0000ff']
        },
        orient: 'horizontal',
        left: 'center',
        bottom: 10,
        text: ['高度高', '高度低'],
        calculable: true,
        seriesIndex: [0, 1],
    },
    xAxis3D: {
      type: 'value',
      name: '经度(°)',
         nameTextStyle: { color: '#ff0000' },
      axisLabel: {
          formatter: (value: number) => value.toFixed(4) + '°',
          textStyle: { color: '#ff0000' }
        },
        min: function(value: any) { return value.min - 0.001; },
        max: function(value: any) { return value.max + 0.001; }
    },
    yAxis3D: {
      type: 'value',
      name: '纬度(°)',
         nameTextStyle: { color: '#00ff00' },
      axisLabel: {
          formatter: (value: number) => value.toFixed(4) + '°',
          textStyle: { color: '#00ff00' }
        },
        min: function(value: any) { return value.min - 0.001; },
        max: function(value: any) { return value.max + 0.001; }
    },
    zAxis3D: {
      type: 'value',
      name: '高度(m)',
         nameTextStyle: { color: '#0000ff' },
      axisLabel: {
          formatter: (value: number) => value.toFixed(0) + 'm',
          textStyle: { color: '#0000ff' }
        },
      },
      grid3D: {
        boxWidth: 54,
        boxDepth: 54,
        boxHeight: 54,
        viewControl: { 
          projection: 'perspective', 
          autoRotate: true, 
          autoRotateSpeed: 10,
          distance: 100
        },
        light: { main: { intensity: 1.2, shadow: true }, ambient: { intensity: 0.3 } },
    },
    series: [
      {
        type: 'line3D',
          name: '轨迹0',
          data: chartData0,
        lineStyle: {
            width: 4,
            opacity: 0.9
          },
          itemStyle: {
            opacity: 0.9
          },
          symbol: 'circle',
          symbolSize: 8,
          label: {
            show: true,
            formatter: (params: any) => {
              const item = data0[params.dataIndex];
              if (item && params.value && Array.isArray(params.value)) {
                const [lon, lat, alt] = params.value;
                return `轨迹0\n时间: ${item.time?.toFixed(1) || 'N/A'}s\n经度: ${lon?.toFixed(4) || 'N/A'}°\n纬度: ${lat?.toFixed(4) || 'N/A'}°\n高度: ${alt?.toFixed(0) || 'N/A'}m`;
              }
              return '';
            },
          },
          animation: true,
          animationDuration: 1000,
          animationEasing: 'linear',
        },
        ...(chartData1.length > 0 ? [{
          type: 'line3D',
          name: '轨迹1',
          data: chartData1,
          lineStyle: { 
            width: 4,
            opacity: 0.9
          },
        itemStyle: {
            opacity: 0.9
          },
          symbol: 'circle',
          symbolSize: 8,
          label: {
            show: true,
            formatter: (params: any) => {
              const item = data1?.[params.dataIndex];
              if (item && params.value && Array.isArray(params.value)) {
                const [lon, lat, alt] = params.value;
                return `轨迹1\n时间: ${item.time?.toFixed(1) || 'N/A'}s\n经度: ${lon?.toFixed(4) || 'N/A'}°\n纬度: ${lat?.toFixed(4) || 'N/A'}°\n高度: ${alt?.toFixed(0) || 'N/A'}m`;
              }
              return '';
            },
          },
          animation: true,
          animationDuration: 1000,
          animationEasing: 'linear',
        }] : []),
      ],
    };
    
    chartInstance.setOption(option);
  } catch (error) {
    console.error('图表更新失败:', error);
    message.error('图表渲染失败：' + ((error as Error).message || '未知错误'));
  }
};

const loadTrajectoryData = async () => {
  try {
    tableLoading.value = true;
    const res = await getMissileTrajectory();
    const responseData = res?.data?.data || res?.data || {};
    const data0 = Array.isArray(responseData.missileTrajectory0) ? responseData.missileTrajectory0 : [];
    const data1 = Array.isArray(responseData.missileTrajectory1) ? responseData.missileTrajectory1 : [];
    
    if (data0.length > 0 || data1.length > 0) {
      trajectoryData0.value = data0;
      trajectoryData1.value = data1;
      // 根据选择的数据类型更新表格数据
      updateTableData();
      
      const allTimes = [...data0, ...data1]
        .map(item => Number(item?.time || 0))
        .filter(t => !isNaN(t) && isFinite(t));
      maxTime.value = allTimes.length > 0 ? Math.max(...allTimes) : 0;
      currentTime.value = maxTime.value;
      
      await nextTick();
      if (!chartInstance && chartRef.value) {
        chartInstance = echartsLib.init(chartRef.value);
        window.addEventListener('resize', () => chartInstance?.resize());
      }
      if (chartInstance) {
        updateChart(data0, data1.length > 0 ? data1 : undefined, currentTime.value);
        message.success(`数据加载成功，轨迹0: ${data0.length} 条，轨迹1: ${data1.length} 条，共 ${data0.length + data1.length} 条记录`);
              }
            } else {
      trajectoryData.value = [];
      trajectoryData0.value = [];
      trajectoryData1.value = [];
      currentTime.value = 0;
      maxTime.value = 0;
      if (chartInstance) updateChart([], undefined);
      message.warning('暂无数据');
    }
  } catch (error: any) {
    console.error('加载数据失败:', error);
    message.error('加载数据失败：' + (error?.message || '未知错误'));
    trajectoryData.value = [];
    trajectoryData0.value = [];
    trajectoryData1.value = [];
    currentTime.value = 0;
    maxTime.value = 0;
    if (chartInstance) updateChart([], undefined);
  } finally {
    tableLoading.value = false;
  }
};
const handleBeforeUpload = (file: UploadFile) => {
  fileList.value = [file];
  return false;
};

const handleRemove = () => {
  fileList.value = [];
  return true;
};

// 更新表格数据
const updateTableData = () => {
  if (selectedDataType.value === '0') {
    trajectoryData.value = trajectoryData0.value.length > 0 ? trajectoryData0.value : [];
  } else {
    trajectoryData.value = trajectoryData1.value.length > 0 ? trajectoryData1.value : [];
  }
};

// 根据选择的数据类型加载数据
const loadDataByType = async (dataType: '0' | '1') => {
  try {
    tableLoading.value = true;
    const res = await getMissileTrajectory({ dataType: Number(dataType) });
    const responseData = res?.data?.data || res?.data || {};
    
    if (dataType === '0') {
      const data0 = Array.isArray(responseData.missileTrajectory0) ? responseData.missileTrajectory0 : [];
      trajectoryData0.value = data0;
      trajectoryData.value = data0;
      
      // 更新最大时间
      const times = data0.map((item: any) => Number(item?.time || 0)).filter((t: number) => !isNaN(t) && isFinite(t));
      if (times.length > 0) {
        maxTime.value = Math.max(...times);
        currentTime.value = maxTime.value;
      }
    } else {
      const data1 = Array.isArray(responseData.missileTrajectory1) ? responseData.missileTrajectory1 : [];
      trajectoryData1.value = data1;
      trajectoryData.value = data1;
      
      // 更新最大时间
      const times = data1.map((item: any) => Number(item?.time || 0)).filter((t: number) => !isNaN(t) && isFinite(t));
      if (times.length > 0) {
        maxTime.value = Math.max(...times);
        currentTime.value = maxTime.value;
      }
    }
    
    // 更新图表
    await nextTick();
    if (chartInstance) {
      if (dataType === '0') {
        updateChart(trajectoryData0.value, trajectoryData1.value.length > 0 ? trajectoryData1.value : [], currentTime.value);
      } else {
        updateChart(trajectoryData0.value.length > 0 ? trajectoryData0.value : [], trajectoryData1.value, currentTime.value);
      }
    }
    
    const dataCount = dataType === '0' ? trajectoryData0.value.length : trajectoryData1.value.length;
    message.success(`${dataType === '0' ? '标准' : '测试'}数据加载成功，共 ${dataCount} 条记录`);
  } catch (error: any) {
    console.error('加载数据失败:', error);
    message.error('加载数据失败：' + (error?.message || '未知错误'));
  } finally {
    tableLoading.value = false;
  }
};

// 处理数据类型选择变化
const handleDataTypeChange = (value: string) => {
  selectedDataType.value = value as '0' | '1';
  loadDataByType(value as '0' | '1');
};

const handleUpload = async () => {
  const file = fileList.value[0];
  if (!file) {
    message.warning('请先选择文件');
    return;
  }
  
  try {
    loading.value = true;
    const originFile = ((file as any).originFileObj || file) as File | undefined;
    if (!originFile || typeof (originFile as any).size === 'undefined') {
      message.error('未获取到文件');
      return;
    }
    
    // 1) 先上传文件获取路径（公共上传）
    const uploadFd = new FormData();
    uploadFd.append('file', originFile);
    const uploadRes: any = await upload(uploadFd);
    
    // 优先使用 path 字段（例如：./uploadPath/upload/1765015982375_弹道数据-测试.xlsx）
    const path =
      uploadRes?.data?.path ||
      uploadRes?.path ||
      uploadRes?.data?.fileName ||
      uploadRes?.fileName ||
      uploadRes?.data?.url ||
      uploadRes?.url;
    
    if (!path) {
      message.error('上传失败：未获取到文件路径');
      return;
    }
    
    // 2) 调用后端接口传递路径和 flag
    const formData = new FormData();
    formData.append('path', path);
    // flag: 0表示标准数据，1表示测试数据
    formData.append('flag', String(selectedDataType.value));
    
    const res: any = await uploadMissileTrajectory(formData);
    
    message.success(res?.message || '上传成功，正在加载数据...');
    
    // 3) 上传成功后重新加载数据
    await loadTrajectoryData();
    fileList.value = [];
  } catch (error: any) {
    console.error('上传失败:', error);
    message.error('上传失败：' + (error?.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

const startAnimation = () => {
  if (animationInterval || maxTime.value === 0) {
    if (maxTime.value === 0) message.warning('暂无数据，无法播放动画');
    return;
  }
  
  isPlaying.value = true;
  currentTime.value = 0;
  animationInterval = window.setInterval(() => {
    currentTime.value += 0.1;
    if (currentTime.value >= maxTime.value) {
      currentTime.value = maxTime.value;
      stopAnimation();
    }
    if (chartInstance) {
      updateChart(trajectoryData0.value, trajectoryData1.value.length > 0 ? trajectoryData1.value : undefined, currentTime.value);
    }
  }, 50);
};

const stopAnimation = () => {
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
    isPlaying.value = false;
  }
};

const resetAnimation = () => {
  stopAnimation();
  currentTime.value = 0;
  if (chartInstance) {
    updateChart(trajectoryData0.value, trajectoryData1.value.length > 0 ? trajectoryData1.value : undefined, 0);
  }
};

onMounted(() => {
  nextTick(() => {
    if (chartRef.value) {
      chartInstance = echartsLib.init(chartRef.value);
      window.addEventListener('resize', () => chartInstance?.resize());
      loadTrajectoryData();
    }
  });
});

onBeforeUnmount(() => {
  stopAnimation();
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
    }
});
</script>

<template>
  <div class="w-full h-full p-3 bg-gray-50" style="overflow: hidden;">
    <a-row :gutter="16" class="h-full" style="height: 100%;">
      <!-- 左侧：图表区域和表格 -->
      <a-col :span="16" class="h-full flex flex-col">
        <a-card title="弹道精准度三维图表" class="mb-4" :body-style="{ height: 'calc(60% - 57px)', padding: '0px 16px 2px 16px', display: 'flex', flexDirection: 'column' }">
          <div style="margin-bottom: 2px; display: flex; gap: 8px; align-items: center; flex-shrink: 0; padding-top: 2px;">
            <a-button 
              type="primary"
              @click="startAnimation" 
              :disabled="isPlaying"
              :style="{ backgroundColor: '#4CAF50', borderColor: '#4CAF50' }"
            >
              {{ isPlaying ? '播放中...' : '开始动画' }}
            </a-button>
            <a-button 
              danger
              @click="stopAnimation" 
              :disabled="!isPlaying"
              :style="{ backgroundColor: '#f44336', borderColor: '#f44336' }"
            >
              停止动画
            </a-button>
            <a-button 
              @click="resetAnimation"
              :style="{ backgroundColor: '#2196F3', borderColor: '#2196F3', color: 'white' }"
            >
              重置动画
            </a-button>
          </div>
          <div style="margin-bottom: 2px; font-size: 12px; color: #666; text-align: center; flex-shrink: 0;">
            当前时间: {{ currentTime.toFixed(1) }}s / 总时间: {{ maxTime.toFixed(1) }}s | 当前高度: {{ getCurrentHeight(currentTime).toFixed(0) }}m
          </div>
          <div 
            ref="chartRef"
            style="width: 100%; flex: 1; min-height: 300px; margin-top: 0;"
          ></div>
        </a-card>
        
        <a-card title="导弹性能参数准确度" class="flex-1" :body-style="{ padding: '16px' }">
          <Table
            :columns="performanceAccuracyColumns"
            :data-source="performanceAccuracyData"
            :pagination="false"
            size="middle"
            bordered
          />
        </a-card>
      </a-col>

      <a-col :span="8" class="h-full flex flex-col">
        <a-card title="数据上传" class="mb-4">
          <Space direction="vertical" class="w-full" :size="16">
            <div>
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <label class="text-sm font-medium" style="white-space: nowrap;">上传Excel文件：</label>
                <a-select
                  v-model="selectedDataType"
                  style="width: 120px"
                  @change="handleDataTypeChange"
                >
                  <a-select-option value="0">标准数据</a-select-option>
                  <a-select-option value="1">测试数据</a-select-option>
                </a-select>
              </div>
              <a-upload
                :file-list="fileList"
                :before-upload="handleBeforeUpload"
                :on-remove="handleRemove"
                accept=".xlsx,.xls"
                :max-count="1"
              >
                <a-button :loading="loading">
                  <UploadOutlined />
                  选择文件
                </a-button>
              </a-upload>
            </div>
            <a-button
              type="primary"
              :loading="loading"
              :disabled="fileList.length === 0"
              @click="handleUpload"
              class="w-full"
            >
              上传文件
            </a-button>
          </Space>
        </a-card>

        <a-card title="数据列表" class="flex-1" :body-style="{ height: 'calc(100% - 57px)', padding: '16px', display: 'flex', flexDirection: 'column' }">
          <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <label class="text-sm font-medium" style="white-space: nowrap;">数据类型：</label>
            <a-select
              v-model="selectedDataType"
              style="width: 120px"
              @change="handleDataTypeChange"
            >
              <a-select-option value="0">标准数据</a-select-option>
              <a-select-option value="1">测试数据</a-select-option>
            </a-select>
          </div>
          <div style="flex: 1; overflow: auto;">
          <Table
            :columns="columns"
            :data-source="trajectoryData"
            :loading="tableLoading"
            :pagination="{ pageSize: 10, showSizeChanger: true }"
            size="small"
            bordered
          />
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
:deep(.ant-card-body) {
  display: flex;
  flex-direction: column;
}

/* 防止整体页面滚动 */
.w-full.h-full {
  overflow: hidden !important;
  height: 100vh;
}

:deep(.ant-row) {
  height: 100% !important;
  overflow: hidden;
}

:deep(.ant-col) {
  height: 100% !important;
  overflow: hidden;
}
</style>
