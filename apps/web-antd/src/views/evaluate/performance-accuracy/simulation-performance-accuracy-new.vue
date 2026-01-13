<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue';
import { Card, Select, Button, Table, Upload, message, Space, Descriptions, Modal } from 'ant-design-vue';
import { UploadOutlined, CalculatorOutlined, ZoomInOutlined } from '@ant-design/icons-vue';
import type { UploadFile, TableColumnsType } from 'ant-design-vue';
import {
  EchartsUI,
  type EchartsUIType,
  useEcharts,
  echarts as echartsLib,
} from '@vben/plugins/echarts';

// 算法相关
import { listAlgorithm } from '#/api/evaluate/algorithm';
import { uploadPerformanceFile, uploadPerformanceAccuracy, selectPerformanceAccuracy } from '#/api/evaluate/performance-accuracy';

const algorithmList = ref<any[]>([]);
const algorithmLoaded = ref(false);
const selectedAlgorithmId = ref<number | undefined>(undefined);
const selectedAlgorithm = computed(() => {
  return algorithmList.value.find(item => item.id === selectedAlgorithmId.value);
});
const algorithmOptions = computed(() =>
  algorithmList.value.map((item: any) => ({ label: item.name, value: item.id })),
);

// 数据相关
const standardDataList = ref<any[]>([]);
const testDataList = ref<any[]>([]);
const standardFileList = ref<UploadFile[]>([]);
const testFileList = ref<UploadFile[]>([]);
const performanceAccuracyResult = ref<any>({});
// 缓存曲线数据，用于放大查看
const cachedCurveData = ref<CurveData[]>([]);
// 最大速度 / 最大加速度表格与图表数据
const maxSpeedStandardTable = ref<any[]>([]);
const maxSpeedTestTable = ref<any[]>([]);
const maxSpeedScoreTable = ref<any[]>([]);
const maxAccelerationStandardTable = ref<any[]>([]);
const maxAccelerationTestTable = ref<any[]>([]);
const maxAccelerationScoreTable = ref<any[]>([]);
const maxDataSelect = ref<'max_speed' | 'max_acceleration'>('max_speed');
const maxDataOptions = [
  { label: '最大速度', value: 'max_speed' },
  { label: '最大加速度', value: 'max_acceleration' },
];
const maxSpeedChartData = ref<{ heights: string[]; standard: (number | null)[]; test: (number | null)[] }>({ heights: [], standard: [], test: [] });
const maxAccelerationChartData = ref<{ heights: string[]; standard: (number | null)[]; test: (number | null)[] }>({ heights: [], standard: [], test: [] });
const maxSpeedChartRef = ref<EchartsUIType>();
const maxAccelerationChartRef = ref<EchartsUIType>();

// 图表相关（6 个曲线图）
type CurveData = { 
  time: number[]; 
  standard: (number | null)[]; 
  test: (number | null)[]; 
  diff: (number | null)[];
  // 滚转角特殊字段：支持30度和60度两条曲线
  standard30?: (number | null)[];
  standard60?: (number | null)[];
  test30?: (number | null)[];
  test60?: (number | null)[];
  diff30?: (number | null)[]; // 30度偏差
  diff60?: (number | null)[]; // 60度偏差
  // 航向角特殊字段：支持60度和120度两条曲线
  standardHeading60?: (number | null)[];
  standardHeading120?: (number | null)[];
  testHeading60?: (number | null)[];
  testHeading120?: (number | null)[];
  diffHeading60?: (number | null)[]; // 60度偏差
  diffHeading120?: (number | null)[]; // 120度偏差
  // 耗油率特殊字段：支持5个高度的曲线
  standardFuel6000?: (number | null)[];
  standardFuel8000?: (number | null)[];
  standardFuel10000?: (number | null)[];
  standardFuel12000?: (number | null)[];
  standardFuel14000?: (number | null)[];
  testFuel6000?: (number | null)[];
  testFuel8000?: (number | null)[];
  testFuel10000?: (number | null)[];
  testFuel12000?: (number | null)[];
  testFuel14000?: (number | null)[];
  diffFuel6000?: (number | null)[]; // 6000m偏差
  diffFuel8000?: (number | null)[]; // 8000m偏差
  diffFuel10000?: (number | null)[]; // 10000m偏差
  diffFuel12000?: (number | null)[]; // 12000m偏差
  diffFuel14000?: (number | null)[]; // 14000m偏差
};
type CurveMeta = { key: string; title: string };
const curveMetaList: CurveMeta[] = [
  { key: 'speed', title: '速度指令控制' },
  { key: 'roll_angle', title: '滚转角指令控制' },
  { key: 'heading_angle', title: '航向角指令' },
  { key: 'fuel_consumption', title: '耗油率' },
  { key: 'maximum_overload', title: '最大过载' },
  { key: 'performance_accuracy', title: '性能准确度' },
];

const emptyCurve = (): CurveData => ({ time: [], standard: [], test: [], diff: [] });
const curveList = ref<CurveData[]>(Array.from({ length: curveMetaList.length }, () => emptyCurve()));

type ChartRenderer = {
  id: number;
  key: string;
  title: string;
  chartRef: any;
  bindRef: (el: any) => void;
  renderEcharts: (option: any) => void;
};

const createRenderer = (idx: number, meta: CurveMeta): ChartRenderer => {
  const chartRef = ref<EchartsUIType>();
  const { renderEcharts } = useEcharts(chartRef);
  const bindRef = (el: any) => {
    chartRef.value = el || undefined;
  };
  return { id: idx, key: meta.key, title: meta.title, chartRef, bindRef, renderEcharts };
};

const chartRenderers = ref<ChartRenderer[]>(
  curveMetaList.map((meta, idx) => createRenderer(idx, meta)),
);

const metricKeyMap: Record<string, { std: string; test: string }> = {
  speed: { std: 'speed0', test: 'speed1' },
  roll_angle: { std: 'roll_angle0', test: 'roll_angle1' },
  heading_angle: { std: 'heading_angle0', test: 'heading_angle1' },
  fuel_consumption: { std: 'fuel_consumption0', test: 'fuel_consumption1' },
  maximum_overload: { std: 'maximum_overload0', test: 'maximum_overload1' },
  performance_accuracy: { std: 'performance_accuracy0', test: 'performance_accuracy1' },
};

const normalizeSeries = (arr: any): { time: number[]; value: number[] } => {
  if (!Array.isArray(arr)) return { time: [], value: [] };
  const time: number[] = [];
  const value: number[] = [];
  arr?.forEach((item: any, idx: number) => {
    const tRaw = item?.time;
    const t = tRaw === 0 || tRaw === '0' ? 0 : tRaw ? Number(tRaw) || idx + 1 : idx + 1;
    const valEntry = Object.entries(item || {}).find(
      ([k, v]) => k !== 'time' && v !== undefined && v !== null && !Number.isNaN(Number(v)),
    );
    if (valEntry && !Number.isNaN(Number(valEntry[1]))) {
      time.push(t);
      value.push(Number(valEntry[1]));
    }
  });
  return { time, value };
};

// 专门处理滚转角数据（包含30度和60度两条曲线）
const normalizeRollAngleSeries = (arr: any): { 
  time: number[]; 
  value30: (number | null)[]; 
  value60: (number | null)[] 
} => {
  if (!Array.isArray(arr)) return { time: [], value30: [], value60: [] };
  const time: number[] = [];
  const value30: (number | null)[] = [];
  const value60: (number | null)[] = [];
  arr?.forEach((item: any, idx: number) => {
    const tRaw = item?.time;
    const t = tRaw === 0 || tRaw === '0' ? 0 : tRaw ? Number(tRaw) || idx + 1 : idx + 1;
    // 后端返回的字段名是 pitchAngle30 和 pitchAngle60
    const val30 = item?.pitchAngle30;
    const val60 = item?.pitchAngle60;
    // 只要有一个值存在就添加时间点
    if (val30 !== undefined || val60 !== undefined) {
      time.push(t);
      value30.push(val30 !== undefined && val30 !== null && !Number.isNaN(Number(val30)) ? Number(val30) : null);
      value60.push(val60 !== undefined && val60 !== null && !Number.isNaN(Number(val60)) ? Number(val60) : null);
    }
  });
  return { time, value30, value60 };
};

// 专门处理航向角数据（包含60度和120度两条曲线）
const normalizeHeadingAngleSeries = (arr: any): { 
  time: number[]; 
  value60: (number | null)[]; 
  value120: (number | null)[] 
} => {
  if (!Array.isArray(arr)) return { time: [], value60: [], value120: [] };
  const time: number[] = [];
  const value60: (number | null)[] = [];
  const value120: (number | null)[] = [];
  arr?.forEach((item: any, idx: number) => {
    const tRaw = item?.time;
    const t = tRaw === 0 || tRaw === '0' ? 0 : tRaw ? Number(tRaw) || idx + 1 : idx + 1;
    const val60 = item?.commandHeading60;
    const val120 = item?.commandHeading120;
    if (val60 !== undefined && val60 !== null && !Number.isNaN(Number(val60))) {
      time.push(t);
      value60.push(Number(val60));
      value120.push(val120 !== undefined && val120 !== null && !Number.isNaN(Number(val120)) ? Number(val120) : null);
    } else if (val120 !== undefined && val120 !== null && !Number.isNaN(Number(val120))) {
      time.push(t);
      value60.push(null);
      value120.push(Number(val120));
    }
  });
  return { time, value60, value120 };
};

// 专门处理耗油率数据（包含5个高度的曲线）
const normalizeFuelConsumptionSeries = (arr: any): { 
  time: number[]; 
  value6000: (number | null)[]; 
  value8000: (number | null)[]; 
  value10000: (number | null)[]; 
  value12000: (number | null)[]; 
  value14000: (number | null)[] 
} => {
  if (!Array.isArray(arr)) return { time: [], value6000: [], value8000: [], value10000: [], value12000: [], value14000: [] };
  const time: number[] = [];
  const value6000: (number | null)[] = [];
  const value8000: (number | null)[] = [];
  const value10000: (number | null)[] = [];
  const value12000: (number | null)[] = [];
  const value14000: (number | null)[] = [];
  
  arr?.forEach((item: any, idx: number) => {
    const tRaw = item?.time;
    const t = tRaw === 0 || tRaw === '0' ? 0 : tRaw ? Number(tRaw) || idx + 1 : idx + 1;
    const val6000 = item?.fuelConsumption6000;
    const val8000 = item?.fuelConsumption8000;
    const val10000 = item?.fuelConsumption10000;
    const val12000 = item?.fuelConsumption12000;
    const val14000 = item?.fuelConsumption14000;
    
    // 只要有一个值存在就添加时间点
    if (val6000 !== undefined || val8000 !== undefined || val10000 !== undefined || val12000 !== undefined || val14000 !== undefined) {
      time.push(t);
      value6000.push(val6000 !== undefined && val6000 !== null && !Number.isNaN(Number(val6000)) ? Number(val6000) : null);
      value8000.push(val8000 !== undefined && val8000 !== null && !Number.isNaN(Number(val8000)) ? Number(val8000) : null);
      value10000.push(val10000 !== undefined && val10000 !== null && !Number.isNaN(Number(val10000)) ? Number(val10000) : null);
      value12000.push(val12000 !== undefined && val12000 !== null && !Number.isNaN(Number(val12000)) ? Number(val12000) : null);
      value14000.push(val14000 !== undefined && val14000 !== null && !Number.isNaN(Number(val14000)) ? Number(val14000) : null);
    }
  });
  return { time, value6000, value8000, value10000, value12000, value14000 };
};

const applyPerformanceAccuracyToCurves = (data: any) => {
  const nextCurves: CurveData[] = [];
  curveMetaList.forEach((meta) => {
    const mapKey = metricKeyMap[meta.key];
    // 兼容带空格和下划线的键名格式（如 "maximum overload0" 和 "maximum_overload0"）
    const rawStd = data?.[mapKey.std] || data?.[mapKey.std.replace(/_/g, ' ')];
    const rawTest = data?.[mapKey.test] || data?.[mapKey.test.replace(/_/g, ' ')];
    
    // 滚转角特殊处理
    if (meta.key === 'roll_angle') {
      const stdArr = Array.isArray(rawStd) ? rawStd : [];
      const testArr = Array.isArray(rawTest) ? rawTest : [];
      const stdSeries = normalizeRollAngleSeries(stdArr);
      const testSeries = normalizeRollAngleSeries(testArr);
      
      // 合并时间轴
      const allTimes = [...new Set([...stdSeries.time, ...testSeries.time])].sort((a, b) => a - b);
      const time: number[] = [];
      const standard30: (number | null)[] = [];
      const standard60: (number | null)[] = [];
      const test30: (number | null)[] = [];
      const test60: (number | null)[] = [];
      const standard: (number | null)[] = []; // 使用30度作为主标准线
      const test: (number | null)[] = []; // 使用30度作为主测试线
      const diff: (number | null)[] = [];
      const diff30: (number | null)[] = []; // 30度偏差
      const diff60: (number | null)[] = []; // 60度偏差
      
      allTimes.forEach((t) => {
        const stdIdx = stdSeries.time.indexOf(t);
        const testIdx = testSeries.time.indexOf(t);
        
        time.push(t);
        const std30Val = stdIdx >= 0 ? (stdSeries.value30[stdIdx] ?? null) : null;
        const std60Val = stdIdx >= 0 ? (stdSeries.value60[stdIdx] ?? null) : null;
        const test30Val = testIdx >= 0 ? (testSeries.value30[testIdx] ?? null) : null;
        const test60Val = testIdx >= 0 ? (testSeries.value60[testIdx] ?? null) : null;
        
        standard30.push(std30Val);
        standard60.push(std60Val);
        test30.push(test30Val);
        test60.push(test60Val);
        
        // 主曲线使用30度数据
        standard.push(std30Val);
        test.push(test30Val);
        
        // 偏差计算（使用30度）
        if (std30Val != null && test30Val != null) {
          diff.push(Math.abs(test30Val - std30Val));
        } else {
          diff.push(null);
        }
        
        // 30度偏差计算
        if (std30Val != null && test30Val != null) {
          diff30.push(Math.abs(test30Val - std30Val));
        } else {
          diff30.push(null);
        }
        
        // 60度偏差计算
        if (std60Val != null && test60Val != null) {
          diff60.push(Math.abs(test60Val - std60Val));
        } else {
          diff60.push(null);
        }
      });
      
      nextCurves.push({ 
        time, 
        standard, 
        test, 
        diff,
        standard30,
        standard60,
        test30,
        test60,
        diff30,
        diff60
      });
    } else if (meta.key === 'heading_angle') {
      // 航向角特殊处理
      const stdArr = Array.isArray(rawStd) ? rawStd : [];
      const testArr = Array.isArray(rawTest) ? rawTest : [];
      const stdSeries = normalizeHeadingAngleSeries(stdArr);
      const testSeries = normalizeHeadingAngleSeries(testArr);
      
      // 合并时间轴
      const allTimes = [...new Set([...stdSeries.time, ...testSeries.time])].sort((a, b) => a - b);
      const time: number[] = [];
      const standardHeading60: (number | null)[] = [];
      const standardHeading120: (number | null)[] = [];
      const testHeading60: (number | null)[] = [];
      const testHeading120: (number | null)[] = [];
      const standard: (number | null)[] = []; // 使用60度作为主标准线
      const test: (number | null)[] = []; // 使用60度作为主测试线
      const diff: (number | null)[] = [];
      const diffHeading60: (number | null)[] = []; // 60度偏差
      const diffHeading120: (number | null)[] = []; // 120度偏差
      
      allTimes.forEach((t) => {
        const stdIdx = stdSeries.time.indexOf(t);
        const testIdx = testSeries.time.indexOf(t);
        
        time.push(t);
        const std60Val = stdIdx >= 0 ? (stdSeries.value60[stdIdx] ?? null) : null;
        const std120Val = stdIdx >= 0 ? (stdSeries.value120[stdIdx] ?? null) : null;
        const test60Val = testIdx >= 0 ? (testSeries.value60[testIdx] ?? null) : null;
        const test120Val = testIdx >= 0 ? (testSeries.value120[testIdx] ?? null) : null;
        
        standardHeading60.push(std60Val);
        standardHeading120.push(std120Val);
        testHeading60.push(test60Val);
        testHeading120.push(test120Val);
        
        // 主曲线使用60度数据
        standard.push(std60Val);
        test.push(test60Val);
        
        // 偏差计算（使用60度）
        if (std60Val != null && test60Val != null) {
          diff.push(Math.abs(test60Val - std60Val));
        } else {
          diff.push(null);
        }
        
        // 60度偏差计算
        if (std60Val != null && test60Val != null) {
          diffHeading60.push(Math.abs(test60Val - std60Val));
        } else {
          diffHeading60.push(null);
        }
        
        // 120度偏差计算
        if (std120Val != null && test120Val != null) {
          diffHeading120.push(Math.abs(test120Val - std120Val));
        } else {
          diffHeading120.push(null);
        }
      });
      
      nextCurves.push({ 
        time, 
        standard, 
        test, 
        diff,
        standardHeading60,
        standardHeading120,
        testHeading60,
        testHeading120,
        diffHeading60,
        diffHeading120
      });
    } else if (meta.key === 'fuel_consumption') {
      // 耗油率特殊处理
      // 兼容两种键名格式：fuel_consumption0/fuel_consumption1 和 fuel consumption0/fuel consumption1
      const stdArr = Array.isArray(rawStd) ? rawStd : 
                     (Array.isArray(data?.['fuel consumption0']) ? data['fuel consumption0'] : []);
      const testArr = Array.isArray(rawTest) ? rawTest : 
                      (Array.isArray(data?.['fuel consumption1']) ? data['fuel consumption1'] : []);
      const stdSeries = normalizeFuelConsumptionSeries(stdArr);
      const testSeries = normalizeFuelConsumptionSeries(testArr);
      
      // 合并时间轴
      const allTimes = [...new Set([...stdSeries.time, ...testSeries.time])].sort((a, b) => a - b);
      const time: number[] = [];
      const standardFuel6000: (number | null)[] = [];
      const standardFuel8000: (number | null)[] = [];
      const standardFuel10000: (number | null)[] = [];
      const standardFuel12000: (number | null)[] = [];
      const standardFuel14000: (number | null)[] = [];
      const testFuel6000: (number | null)[] = [];
      const testFuel8000: (number | null)[] = [];
      const testFuel10000: (number | null)[] = [];
      const testFuel12000: (number | null)[] = [];
      const testFuel14000: (number | null)[] = [];
      const standard: (number | null)[] = []; // 使用6000m作为主标准线
      const test: (number | null)[] = []; // 使用6000m作为主测试线
      const diff: (number | null)[] = [];
      const diffFuel6000: (number | null)[] = []; // 6000m偏差
      const diffFuel8000: (number | null)[] = []; // 8000m偏差
      const diffFuel10000: (number | null)[] = []; // 10000m偏差
      const diffFuel12000: (number | null)[] = []; // 12000m偏差
      const diffFuel14000: (number | null)[] = []; // 14000m偏差
      
      allTimes.forEach((t) => {
        const stdIdx = stdSeries.time.indexOf(t);
        const testIdx = testSeries.time.indexOf(t);
        
        time.push(t);
        const std6000 = stdIdx >= 0 ? (stdSeries.value6000[stdIdx] ?? null) : null;
        const std8000 = stdIdx >= 0 ? (stdSeries.value8000[stdIdx] ?? null) : null;
        const std10000 = stdIdx >= 0 ? (stdSeries.value10000[stdIdx] ?? null) : null;
        const std12000 = stdIdx >= 0 ? (stdSeries.value12000[stdIdx] ?? null) : null;
        const std14000 = stdIdx >= 0 ? (stdSeries.value14000[stdIdx] ?? null) : null;
        const test6000 = testIdx >= 0 ? (testSeries.value6000[testIdx] ?? null) : null;
        const test8000 = testIdx >= 0 ? (testSeries.value8000[testIdx] ?? null) : null;
        const test10000 = testIdx >= 0 ? (testSeries.value10000[testIdx] ?? null) : null;
        const test12000 = testIdx >= 0 ? (testSeries.value12000[testIdx] ?? null) : null;
        const test14000 = testIdx >= 0 ? (testSeries.value14000[testIdx] ?? null) : null;
        
        standardFuel6000.push(std6000);
        standardFuel8000.push(std8000);
        standardFuel10000.push(std10000);
        standardFuel12000.push(std12000);
        standardFuel14000.push(std14000);
        testFuel6000.push(test6000);
        testFuel8000.push(test8000);
        testFuel10000.push(test10000);
        testFuel12000.push(test12000);
        testFuel14000.push(test14000);
        
        // 主曲线使用6000m数据
        standard.push(std6000);
        test.push(test6000);
        
        // 偏差计算（使用6000m）
        if (std6000 != null && test6000 != null) {
          diff.push(Math.abs(test6000 - std6000));
        } else {
          diff.push(null);
        }
        
        // 各高度偏差计算
        if (std6000 != null && test6000 != null) {
          diffFuel6000.push(Math.abs(test6000 - std6000));
        } else {
          diffFuel6000.push(null);
        }
        
        if (std8000 != null && test8000 != null) {
          diffFuel8000.push(Math.abs(test8000 - std8000));
        } else {
          diffFuel8000.push(null);
        }
        
        if (std10000 != null && test10000 != null) {
          diffFuel10000.push(Math.abs(test10000 - std10000));
        } else {
          diffFuel10000.push(null);
        }
        
        if (std12000 != null && test12000 != null) {
          diffFuel12000.push(Math.abs(test12000 - std12000));
        } else {
          diffFuel12000.push(null);
        }
        
        if (std14000 != null && test14000 != null) {
          diffFuel14000.push(Math.abs(test14000 - std14000));
        } else {
          diffFuel14000.push(null);
        }
      });
      
      nextCurves.push({ 
        time, 
        standard, 
        test, 
        diff,
        standardFuel6000,
        standardFuel8000,
        standardFuel10000,
        standardFuel12000,
        standardFuel14000,
        testFuel6000,
        testFuel8000,
        testFuel10000,
        testFuel12000,
        testFuel14000,
        diffFuel6000,
        diffFuel8000,
        diffFuel10000,
        diffFuel12000,
        diffFuel14000
      });
    } else {
      // 其他图表使用原有逻辑
      const stdArr = Array.isArray(rawStd) ? rawStd : [];
      const testArr = Array.isArray(rawTest) ? rawTest : [];
      const stdSeries = normalizeSeries(stdArr);
      const testSeries = normalizeSeries(testArr);
      // 若一侧为空，不阻断，填充另一侧长度以便至少能看到单侧曲线
      const minLen = Math.min(stdSeries.time.length, testSeries.time.length);
      const maxLen = Math.max(stdSeries.time.length, testSeries.time.length);
      const useLen = maxLen || minLen;
      const time: number[] = [];
      const standard: number[] = [];
      const test: number[] = [];
      const diff: number[] = [];
      for (let i = 0; i < useLen; i++) {
        const tVal = stdSeries.time[i] ?? testSeries.time[i] ?? i + 1;
        const stdVal = stdSeries.value[i];
        const testVal = testSeries.value[i];
        time.push(tVal);
        standard.push(stdVal ?? null);
        test.push(testVal ?? null);
        if (stdVal != null && testVal != null) {
          diff.push(Math.abs(testVal - stdVal));
        } else {
          diff.push(null as any);
        }
      }
      nextCurves.push({ time, standard, test, diff });
    }
  });
  curveList.value = nextCurves;
  // 更新缓存数据
  cachedCurveData.value = JSON.parse(JSON.stringify(nextCurves));
  nextTick(() => renderCurves());
};

// 放大查看
const enlargeVisible = ref(false);
const enlargeIndex = ref<number | null>(null);
const enlargeChartRef = ref<EchartsUIType | null>(null);
const enlargeChartKey = ref(0); // 用于强制重新渲染图表
const enlargeChartInstance = ref<any>(null); // 直接存储 ECharts 实例
// 曲线放大/高度维度放大模式
const enlargeMode = ref<'curve' | 'height'>('curve');
const enlargeHeightType = ref<'max_speed' | 'max_acceleration' | null>(null);
const enlargeTitle = computed(() => {
  if (enlargeMode.value === 'height') {
    if (enlargeHeightType.value === 'max_speed') return '最大速度';
    if (enlargeHeightType.value === 'max_acceleration') return '最大加速度';
    return '高度维度曲线';
  }
  if (enlargeIndex.value === null) return '曲线图';
  return chartRenderers.value[enlargeIndex.value]?.title ?? '曲线图';
});

const renderSingleChart = (renderer: ChartRenderer, data: CurveData) => {
  const { 
    time, standard, test, diff, 
    standard30, standard60, test30, test60, diff30, diff60,
    standardHeading60, standardHeading120, testHeading60, testHeading120, diffHeading60, diffHeading120,
    standardFuel6000, standardFuel8000, standardFuel10000, standardFuel12000, standardFuel14000,
    testFuel6000, testFuel8000, testFuel10000, testFuel12000, testFuel14000,
    diffFuel6000, diffFuel8000, diffFuel10000, diffFuel12000, diffFuel14000
  } = data;
  const draw = () => {
    // 检查 ref 是否存在（可能是 ref 对象或 ref.value）
    const chartInstance = renderer.chartRef?.value || renderer.chartRef;
    if (!chartInstance) return;
    const isSpeed = renderer.key === 'speed';
    const isRollAngle = renderer.key === 'roll_angle';
    const isHeadingAngle = renderer.key === 'heading_angle';
    const isFuelConsumption = renderer.key === 'fuel_consumption';
    
    let option: any;
    
    // 滚转角特殊处理：显示6条线（标准30度、标准60度、测试30度、测试60度、30度偏差、60度偏差）
    if (isRollAngle && standard30 && standard60 && test30 && test60 && diff30 && diff60) {
      option = {
        grid: { bottom: 50, containLabel: true, left: '3%', right: '3%', top: '8%' },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { 
          data: ['标准30度', '标准60度', '测试30度', '测试60度', '30度偏差', '60度偏差'], 
          bottom: 6 
        },
        xAxis: { 
          type: 'category', 
          boundaryGap: false, 
          data: time.map(t => t.toString()), 
          name: '时间（秒）' 
        },
        yAxis: { type: 'value', name: '角度' },
        series: [
          { name: '标准30度', type: 'line', smooth: true, data: standard30, itemStyle: { color: '#1890ff' } },
          { name: '标准60度', type: 'line', smooth: true, data: standard60, itemStyle: { color: '#40a9ff' } },
          { name: '测试30度', type: 'line', smooth: true, data: test30, itemStyle: { color: '#52c41a' } },
          { name: '测试60度', type: 'line', smooth: true, data: test60, itemStyle: { color: '#73d13d' } },
          { name: '30度偏差', type: 'line', smooth: true, data: diff30, itemStyle: { color: '#ff4d4f' } },
          { name: '60度偏差', type: 'line', smooth: true, data: diff60, itemStyle: { color: '#ff7875' } },
        ],
      };
    } else if (isHeadingAngle && standardHeading60 && standardHeading120 && testHeading60 && testHeading120 && diffHeading60 && diffHeading120) {
      // 航向角特殊处理：显示6条线（标准60度、标准120度、测试60度、测试120度、60度偏差、120度偏差）
      option = {
        grid: { bottom: 50, containLabel: true, left: '3%', right: '3%', top: '8%' },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { 
          data: ['标准60度', '标准120度', '测试60度', '测试120度', '60度偏差', '120度偏差'], 
          bottom: 6 
        },
        xAxis: { 
          type: 'category', 
          boundaryGap: false, 
          data: time.map(t => t.toString()), 
          name: '时间（秒）' 
        },
        yAxis: { type: 'value', name: '角度' },
        series: [
          { name: '标准60度', type: 'line', smooth: true, data: standardHeading60, itemStyle: { color: '#1890ff' } },
          { name: '标准120度', type: 'line', smooth: true, data: standardHeading120, itemStyle: { color: '#40a9ff' } },
          { name: '测试60度', type: 'line', smooth: true, data: testHeading60, itemStyle: { color: '#52c41a' } },
          { name: '测试120度', type: 'line', smooth: true, data: testHeading120, itemStyle: { color: '#73d13d' } },
          { name: '60度偏差', type: 'line', smooth: true, data: diffHeading60, itemStyle: { color: '#ff4d4f' } },
          { name: '120度偏差', type: 'line', smooth: true, data: diffHeading120, itemStyle: { color: '#ff7875' } },
        ],
      };
    } else if (isFuelConsumption && standardFuel6000 && standardFuel8000 && standardFuel10000 && standardFuel12000 && standardFuel14000 && 
               testFuel6000 && testFuel8000 && testFuel10000 && testFuel12000 && testFuel14000 &&
               diffFuel6000 && diffFuel8000 && diffFuel10000 && diffFuel12000 && diffFuel14000) {
      // 耗油率特殊处理：显示15条线（5个高度的标准值、测试值和偏差）
      option = {
        grid: { bottom: 120, containLabel: true, left: '3%', right: '3%', top: '8%' },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { 
          data: ['标准6000m', '标准8000m', '标准10000m', '标准12000m', '标准14000m', 
                 '测试6000m', '测试8000m', '测试10000m', '测试12000m', '测试14000m',
                 '6000m偏差', '8000m偏差', '10000m偏差', '12000m偏差', '14000m偏差'], 
          bottom: 30
        },
        xAxis: { 
          type: 'category', 
          boundaryGap: false, 
          data: time.map(t => t.toString()), 
          name: '时间（秒）' 
        },
        yAxis: { type: 'value', name: '耗油率' },
        series: [
          { name: '标准6000m', type: 'line', smooth: true, data: standardFuel6000, itemStyle: { color: '#1890ff' } },
          { name: '标准8000m', type: 'line', smooth: true, data: standardFuel8000, itemStyle: { color: '#40a9ff' } },
          { name: '标准10000m', type: 'line', smooth: true, data: standardFuel10000, itemStyle: { color: '#69c0ff' } },
          { name: '标准12000m', type: 'line', smooth: true, data: standardFuel12000, itemStyle: { color: '#91d5ff' } },
          { name: '标准14000m', type: 'line', smooth: true, data: standardFuel14000, itemStyle: { color: '#bae7ff' } },
          { name: '测试6000m', type: 'line', smooth: true, data: testFuel6000, itemStyle: { color: '#52c41a' } },
          { name: '测试8000m', type: 'line', smooth: true, data: testFuel8000, itemStyle: { color: '#73d13d' } },
          { name: '测试10000m', type: 'line', smooth: true, data: testFuel10000, itemStyle: { color: '#95de64' } },
          { name: '测试12000m', type: 'line', smooth: true, data: testFuel12000, itemStyle: { color: '#b7eb8f' } },
          { name: '测试14000m', type: 'line', smooth: true, data: testFuel14000, itemStyle: { color: '#d9f7be' } },
          { name: '6000m偏差', type: 'line', smooth: true, data: diffFuel6000, itemStyle: { color: '#ff4d4f' } },
          { name: '8000m偏差', type: 'line', smooth: true, data: diffFuel8000, itemStyle: { color: '#ff7875' } },
          { name: '10000m偏差', type: 'line', smooth: true, data: diffFuel10000, itemStyle: { color: '#ff9c9c' } },
          { name: '12000m偏差', type: 'line', smooth: true, data: diffFuel12000, itemStyle: { color: '#ffb3b3' } },
          { name: '14000m偏差', type: 'line', smooth: true, data: diffFuel14000, itemStyle: { color: '#ffcccc' } },
        ],
      };
    } else {
      // 其他图表使用原有逻辑
      option = {
        grid: { bottom: 50, containLabel: true, left: '3%', right: '3%', top: '8%' },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { data: ['标准数据', '测试数据', '偏差'], bottom: 6 },
        xAxis: { type: 'category', boundaryGap: false, data: time.map(t => t.toString()), name: '时间（秒）' },
        yAxis: { type: 'value', name: isSpeed ? '速度' : '数值' },
        series: [
          { name: '标准数据', type: 'line', smooth: true, data: standard, itemStyle: { color: '#1890ff' } },
          { name: '测试数据', type: 'line', smooth: true, data: test, itemStyle: { color: '#52c41a' } },
          { name: '偏差', type: 'line', smooth: true, data: diff, itemStyle: { color: '#ff4d4f' } },
        ],
      };
    }
    
    renderer.renderEcharts(option);
  };
  const chartInstance = renderer.chartRef?.value || renderer.chartRef;
  if (!chartInstance) {
    nextTick(draw);
    setTimeout(draw, 50);
    setTimeout(draw, 120);
    setTimeout(draw, 200);
  } else {
    draw();
  }
};

const renderEnlargeChart = () => {
  console.log('[放大图表] renderEnlargeChart 开始执行');
  console.log('[放大图表] enlargeIndex.value:', enlargeIndex.value);
  console.log('[放大图表] enlargeChartRef.value:', enlargeChartRef.value);

  if (enlargeIndex.value === null) {
    console.log('[放大图表] enlargeIndex 为 null，退出');
    return;
  }

  const idx = enlargeIndex.value;
  // 优先使用缓存数据，如果没有则使用当前数据
  const data = cachedCurveData.value[idx] || curveList.value[idx] || emptyCurve();
  const renderer = chartRenderers.value[idx];

  console.log('[放大图表] idx:', idx);
  console.log('[放大图表] data:', data);
  console.log('[放大图表] renderer:', renderer);
  console.log('[放大图表] data.time.length:', data?.time?.length);
  console.log('[放大图表] data.standard.length:', data?.standard?.length);

  if (!renderer) {
    console.log('[放大图表] renderer 不存在，退出');
    return;
  }
  
  const { 
    time, standard, test, diff, 
    standard30, standard60, test30, test60, diff30, diff60,
    standardHeading60, standardHeading120, testHeading60, testHeading120, diffHeading60, diffHeading120,
    standardFuel6000, standardFuel8000, standardFuel10000, standardFuel12000, standardFuel14000,
    testFuel6000, testFuel8000, testFuel10000, testFuel12000, testFuel14000,
    diffFuel6000, diffFuel8000, diffFuel10000, diffFuel12000, diffFuel14000
  } = data;
  const isSpeed = renderer.key === 'speed';
  const isRollAngle = renderer.key === 'roll_angle';
  const isHeadingAngle = renderer.key === 'heading_angle';
  const isFuelConsumption = renderer.key === 'fuel_consumption';
  
  let option: any;
  
  // 滚转角特殊处理：显示6条线（标准30度、标准60度、测试30度、测试60度、30度偏差、60度偏差）
  if (isRollAngle && standard30 && standard60 && test30 && test60 && diff30 && diff60) {
    option = {
      grid: { bottom: 50, containLabel: true, left: '3%', right: '3%', top: '8%' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { 
        data: ['标准30度', '标准60度', '测试30度', '测试60度', '30度偏差', '60度偏差'], 
        bottom: 6 
      },
      xAxis: { 
        type: 'category', 
        boundaryGap: false, 
        data: time.map(t => t.toString()), 
        name: '时间（秒）' 
      },
      yAxis: { type: 'value', name: '角度' },
      series: [
        { name: '标准30度', type: 'line', smooth: true, data: standard30, itemStyle: { color: '#1890ff' } },
        { name: '标准60度', type: 'line', smooth: true, data: standard60, itemStyle: { color: '#40a9ff' } },
        { name: '测试30度', type: 'line', smooth: true, data: test30, itemStyle: { color: '#52c41a' } },
        { name: '测试60度', type: 'line', smooth: true, data: test60, itemStyle: { color: '#73d13d' } },
        { name: '30度偏差', type: 'line', smooth: true, data: diff30, itemStyle: { color: '#ff4d4f' } },
        { name: '60度偏差', type: 'line', smooth: true, data: diff60, itemStyle: { color: '#ff7875' } },
      ],
    };
  } else if (isHeadingAngle && standardHeading60 && standardHeading120 && testHeading60 && testHeading120 && diffHeading60 && diffHeading120) {
    // 航向角特殊处理：显示6条线（标准60度、标准120度、测试60度、测试120度、60度偏差、120度偏差）
    option = {
      grid: { bottom: 50, containLabel: true, left: '3%', right: '3%', top: '8%' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { 
        data: ['标准60度', '标准120度', '测试60度', '测试120度', '60度偏差', '120度偏差'], 
        bottom: 6 
      },
      xAxis: { 
        type: 'category', 
        boundaryGap: false, 
        data: time.map(t => t.toString()), 
        name: '时间（秒）' 
      },
      yAxis: { type: 'value', name: '角度' },
      series: [
        { name: '标准60度', type: 'line', smooth: true, data: standardHeading60, itemStyle: { color: '#1890ff' } },
        { name: '标准120度', type: 'line', smooth: true, data: standardHeading120, itemStyle: { color: '#40a9ff' } },
        { name: '测试60度', type: 'line', smooth: true, data: testHeading60, itemStyle: { color: '#52c41a' } },
        { name: '测试120度', type: 'line', smooth: true, data: testHeading120, itemStyle: { color: '#73d13d' } },
        { name: '60度偏差', type: 'line', smooth: true, data: diffHeading60, itemStyle: { color: '#ff4d4f' } },
        { name: '120度偏差', type: 'line', smooth: true, data: diffHeading120, itemStyle: { color: '#ff7875' } },
      ],
    };
  } else if (isFuelConsumption && standardFuel6000 && standardFuel8000 && standardFuel10000 && standardFuel12000 && standardFuel14000 && 
             testFuel6000 && testFuel8000 && testFuel10000 && testFuel12000 && testFuel14000 &&
             diffFuel6000 && diffFuel8000 && diffFuel10000 && diffFuel12000 && diffFuel14000) {
    // 耗油率特殊处理：显示15条线（5个高度的标准值、测试值和偏差）
    option = {
      grid: { bottom: 120, containLabel: true, left: '3%', right: '3%', top: '8%' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { 
        data: ['标准6000m', '标准8000m', '标准10000m', '标准12000m', '标准14000m', 
               '测试6000m', '测试8000m', '测试10000m', '测试12000m', '测试14000m',
               '6000m偏差', '8000m偏差', '10000m偏差', '12000m偏差', '14000m偏差'], 
        bottom: 30
      },
      xAxis: { 
        type: 'category', 
        boundaryGap: false, 
        data: time.map(t => t.toString()), 
        name: '时间（秒）' 
      },
      yAxis: { type: 'value', name: '耗油率' },
      series: [
        { name: '标准6000m', type: 'line', smooth: true, data: standardFuel6000, itemStyle: { color: '#1890ff' } },
        { name: '标准8000m', type: 'line', smooth: true, data: standardFuel8000, itemStyle: { color: '#40a9ff' } },
        { name: '标准10000m', type: 'line', smooth: true, data: standardFuel10000, itemStyle: { color: '#69c0ff' } },
        { name: '标准12000m', type: 'line', smooth: true, data: standardFuel12000, itemStyle: { color: '#91d5ff' } },
        { name: '标准14000m', type: 'line', smooth: true, data: standardFuel14000, itemStyle: { color: '#bae7ff' } },
        { name: '测试6000m', type: 'line', smooth: true, data: testFuel6000, itemStyle: { color: '#52c41a' } },
        { name: '测试8000m', type: 'line', smooth: true, data: testFuel8000, itemStyle: { color: '#73d13d' } },
        { name: '测试10000m', type: 'line', smooth: true, data: testFuel10000, itemStyle: { color: '#95de64' } },
        { name: '测试12000m', type: 'line', smooth: true, data: testFuel12000, itemStyle: { color: '#b7eb8f' } },
        { name: '测试14000m', type: 'line', smooth: true, data: testFuel14000, itemStyle: { color: '#d9f7be' } },
        { name: '6000m偏差', type: 'line', smooth: true, data: diffFuel6000, itemStyle: { color: '#ff4d4f' } },
        { name: '8000m偏差', type: 'line', smooth: true, data: diffFuel8000, itemStyle: { color: '#ff7875' } },
        { name: '10000m偏差', type: 'line', smooth: true, data: diffFuel10000, itemStyle: { color: '#ff9c9c' } },
        { name: '12000m偏差', type: 'line', smooth: true, data: diffFuel12000, itemStyle: { color: '#ffb3b3' } },
        { name: '14000m偏差', type: 'line', smooth: true, data: diffFuel14000, itemStyle: { color: '#ffcccc' } },
      ],
    };
  } else {
    // 其他图表使用原有逻辑
    option = {
      grid: { bottom: 50, containLabel: true, left: '3%', right: '3%', top: '8%' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { data: ['标准数据', '测试数据', '偏差'], bottom: 6 },
      xAxis: { type: 'category', boundaryGap: false, data: time.map(t => t.toString()), name: '时间（秒）' },
      yAxis: { type: 'value', name: isSpeed ? '速度' : '数值' },
      series: [
        { name: '标准数据', type: 'line', smooth: true, data: standard, itemStyle: { color: '#1890ff' } },
        { name: '测试数据', type: 'line', smooth: true, data: test, itemStyle: { color: '#52c41a' } },
        { name: '偏差', type: 'line', smooth: true, data: diff, itemStyle: { color: '#ff4d4f' } },
      ],
    };
  }
  // 渲染图表，确保 ref 已绑定且 DOM 已渲染
  console.log('[放大图表] 准备渲染，enlargeChartRef.value:', enlargeChartRef.value);
  console.log('[放大图表] option:', option);
  console.log('[放大图表] option.series:', option?.series);

  if (!enlargeChartRef.value) {
    console.warn('[放大图表] enlargeChartRef 不存在，无法渲染');
    return;
  }

  // 检查 DOM 是否已渲染（offsetHeight > 0）
  const checkAndRender = (retryCount = 0) => {
    const componentInstance = enlargeChartRef.value;
    const el = componentInstance?.$el;
    const offsetHeight = componentInstance?.offsetHeight || el?.offsetHeight || 0;

    console.log(`[放大图表] DOM 检查 (尝试 ${retryCount + 1}):`);
    console.log('  - componentInstance:', componentInstance);
    console.log('  - $el:', el);
    console.log('  - componentInstance.offsetHeight:', componentInstance?.offsetHeight);
    console.log('  - el?.offsetHeight:', el?.offsetHeight);
    console.log('  - 最终 offsetHeight:', offsetHeight);

    // 如果 $el 不存在或高度为 0，重试（最多重试 20 次，约 1 秒）
    if (!el || offsetHeight === 0) {
      if (retryCount < 20) {
        console.log(`[放大图表] DOM 未准备好，延迟 50ms 后重试 (${retryCount + 1}/20)`);
        setTimeout(() => checkAndRender(retryCount + 1), 50);
        return;
      } else {
        console.error('[放大图表] 错误：DOM 在 1 秒后仍未准备好，放弃渲染');
        return;
      }
    }

    console.log('[放大图表] DOM 已准备好，直接使用 echarts API 初始化');
    console.log('[放大图表] option.series 数量:', option?.series?.length);
    console.log('[放大图表] option.xAxis.data 数量:', option?.xAxis?.data?.length);

    try {
      // 如果已有实例，先销毁
      if (enlargeChartInstance.value) {
        console.log('[放大图表] 销毁旧的图表实例');
        enlargeChartInstance.value.dispose();
        enlargeChartInstance.value = null;
      }

      // 直接使用 echarts.init 初始化
      console.log('[放大图表] 初始化 echarts 实例，el:', el);
      // 使用动态导入的 echarts
      const echartsInstance = (echartsLib as any);
      if (!echartsInstance || !echartsInstance.init) {
        console.error('[放大图表] 错误：无法获取 echarts 实例');
        return;
      }
      const chartInstance = echartsInstance.init(el);
      console.log('[放大图表] echarts.init 返回:', chartInstance);

      if (!chartInstance) {
        console.error('[放大图表] 错误：echarts.init 返回 null');
        return;
      }

      enlargeChartInstance.value = chartInstance;

      // 设置配置
      console.log('[放大图表] 调用 setOption');
      chartInstance.setOption(option);
      console.log('[放大图表] setOption 调用完成');

      // 延迟检查，确保图表已渲染
      setTimeout(() => {
        const checkEl = componentInstance?.$el;
        const hasCanvas = checkEl?.querySelector('canvas');
        const canvasCount = checkEl?.querySelectorAll('canvas')?.length || 0;
        console.log('[放大图表] 渲染后检查:');
        console.log('  - hasCanvas:', !!hasCanvas);
        console.log('  - canvasCount:', canvasCount);
        console.log('  - checkEl:', checkEl);
        console.log('  - chartInstance:', chartInstance);

        if (!hasCanvas) {
          console.warn('[放大图表] 警告：渲染后未找到 canvas 元素');
          console.warn('[放大图表] 尝试调用 resize 和重新 setOption...');
          // 尝试 resize 和重新设置
          chartInstance.resize();
          chartInstance.setOption(option, true); // 使用 notMerge=true 强制更新
          setTimeout(() => {
            const hasCanvas2 = checkEl?.querySelector('canvas');
            console.log('[放大图表] 重新设置后检查 - hasCanvas:', !!hasCanvas2);
          }, 100);
        } else {
          console.log('[放大图表] ✅ 图表渲染成功！');
        }
      }, 200);
    } catch (error: any) {
      console.error('[放大图表] 渲染异常:', error);
      console.error('[放大图表] 错误堆栈:', error?.stack || '无堆栈信息');
    }
  };

  // 使用 nextTick 确保 DOM 更新完成
  nextTick(() => {
    checkAndRender();
  });
};

const openEnlarge = (idx: number) => {
  console.log('[放大图表] openEnlarge 被调用，idx:', idx);
  // 先清空 ref，确保重新绑定
  enlargeChartRef.value = null;
  enlargeIndex.value = idx;
  enlargeMode.value = 'curve';
  enlargeHeightType.value = null;
  // 每次打开时更新 key，强制重新渲染图表组件
  enlargeChartKey.value = Date.now();
  enlargeVisible.value = true;
  console.log('[放大图表] openEnlarge 设置完成，enlargeIndex:', enlargeIndex.value, 'enlargeVisible:', enlargeVisible.value, 'enlargeChartKey:', enlargeChartKey.value);
  // 不在 openEnlarge 中直接调用 renderEnlargeChart，而是等待 handleEnlargeAfterOpenChange 触发
};

// 打开高度维度放大
const openEnlargeHeight = (type: 'max_speed' | 'max_acceleration') => {
  enlargeChartRef.value = null;
  enlargeIndex.value = null;
  enlargeMode.value = 'height';
  enlargeHeightType.value = type;
  enlargeChartKey.value = Date.now();
  enlargeVisible.value = true;
};

const closeEnlarge = () => {
  enlargeVisible.value = false;
  // 销毁图表实例
  if (enlargeChartInstance.value) {
    console.log('[放大图表] 关闭时销毁图表实例');
    enlargeChartInstance.value.dispose();
    enlargeChartInstance.value = null;
  }
  // 清空 ref 和索引
  enlargeChartRef.value = null;
  enlargeIndex.value = null;
  enlargeHeightType.value = null;
  enlargeMode.value = 'curve';
};

const handleEnlargeAfterOpenChange = (open: boolean) => {
  console.log('[放大图表] handleEnlargeAfterOpenChange 被调用，open:', open);
  console.log('[放大图表] enlargeIndex.value:', enlargeIndex.value);
  console.log('[放大图表] enlargeChartRef.value:', enlargeChartRef.value);

  if (open) {
    // Modal 完全打开后，等待 DOM 渲染完成再渲染图表
    // 使用多层 nextTick 和 setTimeout 确保 DOM 完全准备好
    nextTick(() => {
      console.log('[放大图表] handleEnlargeAfterOpenChange nextTick 1');
      nextTick(() => {
        console.log('[放大图表] handleEnlargeAfterOpenChange nextTick 2');
        setTimeout(() => {
          console.log('[放大图表] handleEnlargeAfterOpenChange setTimeout，准备调用 renderEnlargeChart / renderEnlargeHeightChart');
          if (enlargeMode.value === 'height') {
            renderEnlargeHeightChart();
          } else {
            renderEnlargeChart();
          }
        }, 100); // 增加延迟，确保 Modal 动画完成且 DOM 完全渲染
    });
    });
  } else {
    // Modal 关闭时清空 ref
    console.log('[放大图表] Modal 关闭，清空 ref');
    enlargeChartRef.value = null;
  }
};

// 对比值
const compareValues = ref<{
  score: number | null;
  maxDiff: number | null;
  avgDiff: number | null;
  minDiff: number | null;
}>({
  score: null,
  maxDiff: null,
  avgDiff: null,
  minDiff: null,
});

// 表格列定义
const standardColumns: TableColumnsType = [
  {
    title: '时间（秒）',
    dataIndex: 'time',
    key: 'time',
    width: 120,
  },
  {
    title: '标准值',
    dataIndex: 'standard',
    key: 'standard',
    width: 120,
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    fixed: 'right',
  },
];

const testColumns: TableColumnsType = [
  {
    title: '时间（秒）',
    dataIndex: 'time',
    key: 'time',
    width: 120,
  },
  {
    title: '测试值',
    dataIndex: 'test',
    key: 'test',
    width: 120,
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    fixed: 'right',
  },
];

// 详情模态框
const detailModalVisible = ref(false);
const detailModalData = ref<any[]>([]);
const detailModalTitle = ref('');

// 耗油率表格数据
const fuelConsumptionTableData = ref<any[]>([]);
// 算法类型选择（如：耗油率、滚转角等）
const selectedAlgorithmType = ref<string>('');
const algorithmTypeOptions = ref<Array<{ label: string; value: string }>>([]);
// 存储所有算法数据
const allAlgorithmData = ref<any>({});

// 算法类型映射（英文key到中文名称）
const algorithmTypeMap: Record<string, string> = {
  'fuel consumption': '耗油率',
  'fuel_consumption': '耗油率',
  'roll_angle': '滚转角指令控制',
  'speed': '速度指令控制',
  'heading_angle': '航向角指令控制',
  'maximum overload': '最大过载',
  'maximum_overload': '最大过载',
  'performance_accuracy': '性能准确度',
  'max_speed': '最大速度',
  'max_acceleration': '最大加速度',
};

const sixHeightColumns: TableColumnsType = [
  { title: '时间', dataIndex: 'time', key: 'time', width: 100, fixed: 'left' },
  { title: '6000米', dataIndex: 'h6000', key: 'h6000', width: 110 },
  { title: '8000米', dataIndex: 'h8000', key: 'h8000', width: 110 },
  { title: '10000米', dataIndex: 'h10000', key: 'h10000', width: 120 },
  { title: '12000米', dataIndex: 'h12000', key: 'h12000', width: 120 },
  { title: '14000米', dataIndex: 'h14000', key: 'h14000', width: 120 },
];

const formatScoreRow = (obj: any) => {
  if (!obj) return [];
  const fmt = (v: any) =>
    v === null || v === undefined || Number.isNaN(Number(v))
      ? '-'
      : `${(Number(v) * 100).toFixed(4)}%`;
  return [
    {
      key: 1,
      time: obj.time ?? '-',
      h6000: fmt(obj.height6000),
      h8000: fmt(obj.height8000),
      h10000: fmt(obj.height10000),
      h12000: fmt(obj.height12000),
      h14000: fmt(obj.height14000),
    },
  ];
};

const formatListRows = (list: any[]) => {
  if (!Array.isArray(list)) return [];
  return list.map((item, idx) => ({
    key: item.id ?? idx,
    time: item.time ?? '-',
    h6000: item.height6000 ?? '-',
    h8000: item.height8000 ?? '-',
    h10000: item.height10000 ?? '-',
    h12000: item.height12000 ?? '-',
    h14000: item.height14000 ?? '-',
  }));
};

// 生成高度维度数据（y: 高度，x: 数值），取首行
const buildHeightChartData = (stdList: any[], testList: any[]) => {
  const heights = ['6000', '8000', '10000', '12000', '14000'];
  const pick = (list: any[], field: string) => {
    if (!Array.isArray(list) || list.length === 0) return null;
    const v = list[0]?.[field];
    return v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v);
  };
  return {
    heights,
    standard: heights.map((h) => pick(stdList, `height${h}`)),
    test: heights.map((h) => pick(testList, `height${h}`)),
  };
};

// 动态生成表格列定义
const fuelConsumptionColumns = computed<TableColumnsType>(() => {
  const selectedType = selectedAlgorithmType.value.toLowerCase().replace(/\s+/g, '_');
  console.log('[表格列定义] 开始生成列，selectedAlgorithmType.value:', selectedAlgorithmType.value);
  console.log('[表格列定义] selectedType:', selectedType);

  // 性能准确度不需要时间字段
  if (selectedType.includes('performance_accuracy') || selectedType.includes('performance accuracy')) {
    console.log('[表格列定义] 匹配到性能准确度');
    const baseColumns: TableColumnsType = [];
    // 性能准确度：特殊结构，显示维度、类型、变量、变量值、备注
    baseColumns.push(
  {
        title: '维度',
        dataIndex: 'dimension',
        key: 'dimension',
        width: 150,
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        width: 150,
  },
  {
        title: '变量',
        dataIndex: 'variable',
        key: 'variable',
        width: 200,
      },
      {
        title: '标准值',
        dataIndex: 'stdValue',
        key: 'stdValue',
        width: 120,
      },
      {
        title: '测试值',
        dataIndex: 'testValue',
        key: 'testValue',
        width: 120,
      },
      {
        title: '偏差',
        dataIndex: 'diff',
        key: 'diff',
        width: 120,
      },
      {
        title: '单位',
        dataIndex: 'remarks',
        key: 'remarks',
        width: 100,
      }
    );
    return baseColumns;
  }

  // 其他算法类型需要时间字段
  // 速度和最大过载的时间字段宽度较小
  const timeColumnWidth = (selectedType.includes('speed') || selectedType.includes('overload')) ? 80 : 120;
  const baseColumns: TableColumnsType = [
    {
      title: '时间（秒）',
      dataIndex: 'time',
      key: 'time',
      width: timeColumnWidth,
      fixed: 'left',
  },
  ];

  if (selectedType.includes('fuel') || selectedType.includes('consumption')) {
    console.log('[表格列定义] 匹配到耗油率');
    // 耗油率：5个高度，每个高度显示标准值、测试值、偏差
    const heights = ['6000', '8000', '10000', '12000', '14000'];
    heights.forEach((height) => {
      baseColumns.push({
        title: `${height}m`,
    children: [
      {
        title: '标准值',
            dataIndex: `std${height}`,
            key: `std${height}`,
            width: 120,
      },
      {
        title: '测试值',
            dataIndex: `test${height}`,
            key: `test${height}`,
            width: 120,
      },
      {
        title: '偏差',
            dataIndex: `diff${height}`,
            key: `diff${height}`,
            width: 120,
      },
    ],
      });
    });
  } else if (selectedType.includes('heading')) {
    // 航向角：60度和120度（不包含30度）
    console.log('[表格列定义] 匹配到航向角，selectedType:', selectedType);
    console.log('[表格列定义] selectedType.includes("heading"):', selectedType.includes('heading'));
    const angles = ['60', '120'];
    console.log('[表格列定义] 航向角使用的角度数组:', angles);
    angles.forEach((angle) => {
      console.log('[航向角] 添加角度列:', angle);
      baseColumns.push({
        title: `${angle}度`,
    children: [
      {
        title: '标准值',
            dataIndex: `std${angle}`,
            key: `std${angle}`,
            width: 120,
      },
      {
        title: '测试值',
            dataIndex: `test${angle}`,
            key: `test${angle}`,
            width: 120,
      },
      {
        title: '偏差',
            dataIndex: `diff${angle}`,
            key: `diff${angle}`,
            width: 120,
      },
    ],
      });
    });
    console.log('[航向角] 最终生成的列:', baseColumns);
  } else if ((selectedType.includes('roll') || selectedType.includes('angle')) && !selectedType.includes('heading')) {
    // 滚转角：30度和60度（必须排除heading，因为heading_angle包含angle）
    console.log('[表格列定义] 匹配到滚转角，selectedType:', selectedType);
    console.log('[表格列定义] selectedType.includes("roll"):', selectedType.includes('roll'));
    console.log('[表格列定义] selectedType.includes("angle"):', selectedType.includes('angle'));
    console.log('[表格列定义] selectedType.includes("heading"):', selectedType.includes('heading'));
    const angles = ['30', '60'];
    console.log('[表格列定义] 滚转角使用的角度数组:', angles);
    angles.forEach((angle) => {
      console.log('[滚转角] 添加角度列:', angle);
      baseColumns.push({
        title: `${angle}度`,
    children: [
      {
        title: '标准值',
            dataIndex: `std${angle}`,
            key: `std${angle}`,
            width: 120,
      },
      {
        title: '测试值',
            dataIndex: `test${angle}`,
            key: `test${angle}`,
            width: 120,
      },
      {
        title: '偏差',
            dataIndex: `diff${angle}`,
            key: `diff${angle}`,
            width: 120,
      },
    ],
      });
    });
    console.log('[滚转角] 最终生成的列:', baseColumns);
  } else if (selectedType.includes('speed') || selectedType.includes('overload')) {
    console.log('[表格列定义] 匹配到速度或最大过载');
    // 速度和最大过载：单个值
    baseColumns.push(
      {
        title: '标准值',
        dataIndex: 'std',
        key: 'std',
        width: 150,
      },
      {
        title: '测试值',
        dataIndex: 'test',
        key: 'test',
        width: 150,
      },
      {
        title: '偏差',
        dataIndex: 'diff',
        key: 'diff',
        width: 150,
      }
    );
  } else {
    console.warn('[表格列定义] 未匹配到任何算法类型，selectedType:', selectedType);
  }

  console.log('[表格列定义] 最终返回的列:', baseColumns);
  console.log('[表格列定义] 列的标题列表:', baseColumns.map((col: any) => {
    if (col.children) {
      return `${col.title} (${col.children.map((c: any) => c.title).join(', ')})`;
    }
    return col.title || '';
  }));
  return baseColumns;
});

// 提取所有算法类型（去掉后面的0/1）
const extractAlgorithmTypes = (data: any) => {
  const algorithmTypes = new Set<string>();

  Object.keys(data || {}).forEach((key) => {
    // 去掉末尾的数字（0或1），提取算法类型
    const baseKey = key.replace(/[01]$/, '').trim();
    if (baseKey && baseKey !== key) {
      // 确保有标准数据（0）和测试数据（1）
      const stdKey = baseKey + '0';
      const testKey = baseKey + '1';
      if (data[stdKey] && data[testKey]) {
        algorithmTypes.add(baseKey);
      }
    }
  });

  // 转换为选项数组，使用中文名称
  algorithmTypeOptions.value = Array.from(algorithmTypes).map((type) => {
    const normalizedType = type.toLowerCase().replace(/\s+/g, '_');
    const chineseName = algorithmTypeMap[normalizedType] || algorithmTypeMap[type] || type;
    return {
      label: chineseName,
      value: type,
    };
  });

  // 如果有算法类型但未选择，默认选择第一个
  if (algorithmTypes.size > 0 && !selectedAlgorithmType.value) {
    selectedAlgorithmType.value = Array.from(algorithmTypes)[0] || '';
  }

  // 存储所有数据
  allAlgorithmData.value = data || {};
};

// 处理算法数据（同时显示标准数据和测试数据）
const processAlgorithmData = (data?: any) => {
  console.log('[processAlgorithmData] 开始处理算法数据');
  // 如果没有传入数据，使用存储的数据
  const sourceData = data || allAlgorithmData.value;
  console.log('[processAlgorithmData] sourceData keys:', Object.keys(sourceData || {}));

  // 提取算法类型选项
  extractAlgorithmTypes(sourceData);

  // 根据选择的算法类型获取标准数据（0）和测试数据（1）
  const selectedType = selectedAlgorithmType.value;
  console.log('[processAlgorithmData] selectedType:', selectedType);
  if (!selectedType) {
    console.log('[processAlgorithmData] selectedType 为空，清空表格数据');
    fuelConsumptionTableData.value = [];
    return;
  }

  const stdKey = selectedType + '0';
  const testKey = selectedType + '1';
  console.log('[processAlgorithmData] stdKey:', stdKey, 'testKey:', testKey);
  const stdData = sourceData?.[stdKey] || [];
  const testData = sourceData?.[testKey] || [];
  console.log('[processAlgorithmData] stdData length:', Array.isArray(stdData) ? stdData.length : 'not array');
  console.log('[processAlgorithmData] testData length:', Array.isArray(testData) ? testData.length : 'not array');
  
  if (!Array.isArray(stdData) && !Array.isArray(testData)) {
    fuelConsumptionTableData.value = [];
    return;
  }
  
  // 合并时间轴
  const allTimes = new Set<number>();
  if (Array.isArray(stdData)) {
    stdData.forEach((item: any) => {
      const t = item?.time ? Number(item.time) : null;
      if (t !== null && !isNaN(t)) allTimes.add(t);
    });
  }
  if (Array.isArray(testData)) {
    testData.forEach((item: any) => {
      const t = item?.time ? Number(item.time) : null;
      if (t !== null && !isNaN(t)) allTimes.add(t);
    });
  }
  
  const normalizedType = selectedType.toLowerCase().replace(/\s+/g, '_');

  // 性能准确度特殊处理（没有time字段）
  if (normalizedType.includes('performance_accuracy') || normalizedType.includes('performance accuracy')) {
    // 合并标准数据和测试数据，按维度、类型、变量匹配
    const mergedData = new Map<string, any>();

    // 处理标准数据
    if (Array.isArray(stdData)) {
      stdData.forEach((item: any) => {
        const key = `${item?.dimension || ''}_${item?.type || ''}_${item?.variable || ''}`;
        if (!mergedData.has(key)) {
          mergedData.set(key, {
            key,
            dimension: item?.dimension || '-',
            type: item?.type || '-',
            variable: item?.variable || '-',
            stdValue: item?.variableValue || '-',
            testValue: '-',
            diff: '-',
            remarks: item?.remarks || '-',
          });
        } else {
          const existing = mergedData.get(key);
          existing.stdValue = item?.variableValue || existing.stdValue;
        }
      });
    }

    // 处理测试数据
    if (Array.isArray(testData)) {
      testData.forEach((item: any) => {
        const key = `${item?.dimension || ''}_${item?.type || ''}_${item?.variable || ''}`;
        if (mergedData.has(key)) {
          const existing = mergedData.get(key);
          const testVal = item?.variableValue;
          const stdVal = existing.stdValue;

          existing.testValue = testVal || '-';

          // 计算偏差
          if (stdVal !== '-' && testVal !== '-' && !isNaN(Number(stdVal)) && !isNaN(Number(testVal))) {
            existing.diff = Math.abs(Number(testVal) - Number(stdVal)).toFixed(6);
          }
        } else {
          mergedData.set(key, {
            key,
            dimension: item?.dimension || '-',
            type: item?.type || '-',
            variable: item?.variable || '-',
            stdValue: '-',
            testValue: item?.variableValue || '-',
            diff: '-',
            remarks: item?.remarks || '-',
          });
        }
      });
    }

    fuelConsumptionTableData.value = Array.from(mergedData.values());
    return;
  }

  // 其他算法类型按时间处理
  const sortedTimes = Array.from(allTimes).sort((a, b) => a - b);
  const tableData: any[] = [];

  // 根据算法类型确定字段名
  const getFieldName = (type: string, height?: string) => {
    const normalizedType = type.toLowerCase().replace(/\s+/g, '_');
    if (normalizedType.includes('fuel') || normalizedType.includes('consumption')) {
      return height ? `fuelConsumption${height}` : null;
    } else if (normalizedType.includes('roll') && !normalizedType.includes('heading')) {
      return height === '30' ? 'pitchAngle30' : height === '60' ? 'pitchAngle60' : null;
    } else if (normalizedType.includes('heading')) {
      const result = height === '60' ? 'commandHeading60' : height === '120' ? 'commandHeading120' : null;
      console.log(`[getFieldName] 航向角，height: ${height}, 返回:`, result);
      return result;
    } else if (normalizedType.includes('speed')) {
      return 'speed';
    } else if (normalizedType.includes('overload')) {
      return 'overload';
    }
    return null;
  };
  
  sortedTimes.forEach((time) => {
    const stdItem = Array.isArray(stdData) 
      ? stdData.find((item: any) => Number(item?.time) === time) 
      : null;
    const testItem = Array.isArray(testData)
      ? testData.find((item: any) => Number(item?.time) === time)
      : null;
    
    const row: any = {
      key: time,
      time: time.toString(),
    };
    
    // 根据算法类型处理不同的字段
    const normalizedType = selectedType.toLowerCase().replace(/\s+/g, '_');

    // 性能准确度特殊处理（没有time字段，是结构化数据）
    if (normalizedType.includes('performance_accuracy') || normalizedType.includes('performance accuracy')) {
      // 性能准确度数据结构不同，需要特殊处理
      // 这里暂时跳过，因为它的数据结构完全不同
      return;
    } else if (normalizedType.includes('fuel') || normalizedType.includes('consumption')) {
      // 耗油率：5个高度
      const heights = ['6000', '8000', '10000', '12000', '14000'];
    heights.forEach((height) => {
        const fieldName = getFieldName(selectedType, height);
        if (fieldName) {
          const stdVal = stdItem?.[fieldName];
          const testVal = testItem?.[fieldName];
      
      const stdNum = stdVal !== undefined && stdVal !== null && !isNaN(Number(stdVal)) 
        ? Number(stdVal) 
        : null;
      const testNum = testVal !== undefined && testVal !== null && !isNaN(Number(testVal))
        ? Number(testVal)
        : null;
      
      row[`std${height}`] = stdNum !== null ? stdNum.toFixed(6) : '-';
      row[`test${height}`] = testNum !== null ? testNum.toFixed(6) : '-';
      row[`diff${height}`] = stdNum !== null && testNum !== null 
        ? Math.abs(testNum - stdNum).toFixed(6) 
        : '-';
        }
    });
    } else if (normalizedType.includes('heading')) {
      // 航向角：60度和120度（必须在roll之前检查，因为heading_angle包含angle）
      console.log('[航向角数据处理] 开始处理航向角数据，normalizedType:', normalizedType);
      const angles = ['60', '120'];
      console.log('[航向角数据处理] 使用的角度数组:', angles);
      angles.forEach((angle) => {
        const fieldName = getFieldName(selectedType, angle);
        console.log(`[航向角数据处理] 角度 ${angle}度，fieldName:`, fieldName);
        if (fieldName) {
          const stdVal = stdItem?.[fieldName];
          const testVal = testItem?.[fieldName];
          console.log(`[航向角数据处理] 角度 ${angle}度，stdVal:`, stdVal, 'testVal:', testVal);

          const stdNum = stdVal !== undefined && stdVal !== null && !isNaN(Number(stdVal))
            ? Number(stdVal)
            : null;
          const testNum = testVal !== undefined && testVal !== null && !isNaN(Number(testVal))
            ? Number(testVal)
            : null;

          row[`std${angle}`] = stdNum !== null ? stdNum.toFixed(6) : '-';
          row[`test${angle}`] = testNum !== null ? testNum.toFixed(6) : '-';
          row[`diff${angle}`] = stdNum !== null && testNum !== null
            ? Math.abs(testNum - stdNum).toFixed(6)
            : '-';
          console.log(`[航向角数据处理] 角度 ${angle}度，row数据:`, {
            [`std${angle}`]: row[`std${angle}`],
            [`test${angle}`]: row[`test${angle}`],
            [`diff${angle}`]: row[`diff${angle}`]
          });
        } else {
          console.warn(`[航向角数据处理] 角度 ${angle}度，getFieldName 返回 null`);
        }
      });
      console.log('[航向角数据处理] 处理完成，row:', row);
    } else if (normalizedType.includes('roll') && !normalizedType.includes('heading')) {
      // 滚转角：30度和60度
      const angles = ['30', '60'];
      angles.forEach((angle) => {
        const fieldName = getFieldName(selectedType, angle);
        if (fieldName) {
          const stdVal = stdItem?.[fieldName];
          const testVal = testItem?.[fieldName];

          const stdNum = stdVal !== undefined && stdVal !== null && !isNaN(Number(stdVal))
            ? Number(stdVal)
            : null;
          const testNum = testVal !== undefined && testVal !== null && !isNaN(Number(testVal))
            ? Number(testVal)
            : null;

          row[`std${angle}`] = stdNum !== null ? stdNum.toFixed(6) : '-';
          row[`test${angle}`] = testNum !== null ? testNum.toFixed(6) : '-';
          row[`diff${angle}`] = stdNum !== null && testNum !== null
            ? Math.abs(testNum - stdNum).toFixed(6)
            : '-';
        }
      });
    } else if (normalizedType.includes('speed')) {
      // 速度：单个值
      const fieldName = getFieldName(selectedType);
      if (fieldName) {
        const stdVal = stdItem?.[fieldName];
        const testVal = testItem?.[fieldName];

        const stdNum = stdVal !== undefined && stdVal !== null && !isNaN(Number(stdVal))
          ? Number(stdVal)
          : null;
        const testNum = testVal !== undefined && testVal !== null && !isNaN(Number(testVal))
          ? Number(testVal)
          : null;

        row['std'] = stdNum !== null ? stdNum.toFixed(6) : '-';
        row['test'] = testNum !== null ? testNum.toFixed(6) : '-';
        row['diff'] = stdNum !== null && testNum !== null
          ? Math.abs(testNum - stdNum).toFixed(6)
          : '-';
      }
    } else if (normalizedType.includes('overload')) {
      // 最大过载：单个值
      const fieldName = getFieldName(selectedType);
      if (fieldName) {
        const stdVal = stdItem?.[fieldName];
        const testVal = testItem?.[fieldName];

        const stdNum = stdVal !== undefined && stdVal !== null && !isNaN(Number(stdVal))
          ? Number(stdVal)
          : null;
        const testNum = testVal !== undefined && testVal !== null && !isNaN(Number(testVal))
          ? Number(testVal)
          : null;

        row['std'] = stdNum !== null ? stdNum.toFixed(6) : '-';
        row['test'] = testNum !== null ? testNum.toFixed(6) : '-';
        row['diff'] = stdNum !== null && testNum !== null
          ? Math.abs(testNum - stdNum).toFixed(6)
          : '-';
      }
    }
    
    tableData.push(row);
  });
  
  fuelConsumptionTableData.value = tableData;
};

// 监听算法类型选择变化
watch(selectedAlgorithmType, () => {
  processAlgorithmData();
});

// 加载算法列表
const loadAlgorithmList = async () => {
  const res: any = await listAlgorithm({ pageNum: 1, pageSize: 999 });
  const rows = res?.data?.rows || res?.rows || [];
  algorithmList.value = rows.map((item: any) => ({
    id: item.id,
    name: item.algorithmTitle,
    code: item.algorithmCode,
    type: item.algorithmType,
    formula: item.formula,
    status: item.status,
  }));
  algorithmLoaded.value = true;
};

const fetchPerformanceAccuracy = async () => {
  try {
    const payload: any = {};
    if (selectedAlgorithm.value?.code) {
      payload.algorithmDifferentiation = selectedAlgorithm.value.code;
    }
    const res: any = await selectPerformanceAccuracy(payload);
    // perfClient 未统一拦截，这里手动取 data.data 作为真实载荷
    const result = res?.data?.data ?? res?.data ?? res ?? {};
    performanceAccuracyResult.value = result;
    // 解析最大速度 / 最大加速度表格与曲线数据
    maxSpeedStandardTable.value = formatListRows(result?.maxSpeedStandard || []);
    maxSpeedTestTable.value = formatListRows(result?.maxSpeedTest || []);
    maxSpeedScoreTable.value = formatScoreRow(result?.maxSpeedScore);
    maxAccelerationStandardTable.value = formatListRows(result?.maxAccelerationStandard || []);
    maxAccelerationTestTable.value = formatListRows(result?.maxAccelerationTest || []);
    maxAccelerationScoreTable.value = formatScoreRow(result?.maxAccelerationScore);
    maxSpeedChartData.value = buildHeightChartData(result?.maxSpeedStandard || [], result?.maxSpeedTest || []);
    maxAccelerationChartData.value = buildHeightChartData(result?.maxAccelerationStandard || [], result?.maxAccelerationTest || []);
    // 存储所有算法数据
    allAlgorithmData.value = result;
    applyPerformanceAccuracyToCurves(performanceAccuracyResult.value);
    processAlgorithmData(result);
    nextTick(() => {
      renderHeightChart(maxSpeedChartRef, maxSpeedChartData.value, '速度');
      renderHeightChart(maxAccelerationChartRef, maxAccelerationChartData.value, '加速度');
    });
  } catch (e) {
    // 后端可能暂未返回有效数据，忽略
  }
};

// 根据文件名识别算法类型
const getAlgorithmTypeFromFileName = (fileName: string): string => {
  // 文件名到类型的映射
  const nameToTypeMap: Record<string, string> = {
    '速度指令控制': 'speed',
    '滚转角指令控制': 'roll_angle',
    '航向角指令': 'heading_angle',
    '耗油率': 'fuel_consumption',
    '最大过载': 'maximum_overload',
    '性能准确度': 'performance_accuracy',
    '最大速度': 'max_speed',
    '最大加速度': 'max_acceleration',
  };

  // 遍历映射，查找文件名中包含的关键词
  for (const [key, value] of Object.entries(nameToTypeMap)) {
    if (fileName.includes(key)) {
      return value;
    }
  }

  // 如果找不到匹配的类型，返回默认值 speed
  return 'speed';
};

const doUpload = async (file: UploadFile, dataType: 0 | 1, onSuccess: () => void) => {
  const algoType = selectedAlgorithm.value?.type;
  const algoCode = selectedAlgorithm.value?.code;
  if (!algoType) {
    message.warning('请先选择算法类型');
    return false;
  }
  const originFile = ((file as any).originFileObj || file) as File | undefined;
  if (!originFile || typeof (originFile as any).size === 'undefined') {
    message.error('未获取到文件');
    return false;
  }
  try {
    // 1) 直传文件获取路径（公共上传）
    const uploadFd = new FormData();
    uploadFd.append('file', originFile);
    const uploadRes: any = await uploadPerformanceFile(uploadFd);

    // 优先使用 fileName 字段（例如：/profile/upload/2025/12/05/速度指令控制-标准_20251205221212A001.xlsx）
    const path =
      uploadRes?.data?.fileName ||
      uploadRes?.fileName ||
      uploadRes?.data?.path ||
      uploadRes?.data?.url ||
      uploadRes?.path ||
      uploadRes?.url;

    if (!path) {
      message.error('上传失败：未获取到文件路径');
      return false;
    }

    // 根据文件名识别算法类型（例如：speed, roll_angle, heading_angle 等）
    const fileName = originFile.name || path;
    const algorithmDifferentiation = getAlgorithmTypeFromFileName(fileName);

    // 2) 调用后端性能准确度接口
    const formData = new FormData();
    formData.append('path', path);
    // algorithmDifferentiation: 根据文件名识别的类型值（如 speed, roll_angle 等）
    formData.append('algorithmDifferentiation', algorithmDifferentiation);
    // flag: 0表示标准数据，1表示测试数据
    formData.append('flag', String(dataType));

    const res: any = await uploadPerformanceAccuracy(formData);
    message.success(res?.message || '上传成功');
    onSuccess();
    // 等待数据刷新完成，确保图表更新
    await fetchPerformanceAccuracy();
    // 给一个短暂的延迟，确保图表渲染完成
    await new Promise(resolve => setTimeout(resolve, 300));
  } catch (e) {
    console.error('上传失败:', e);
    message.error('上传失败：' + (e?.message || '未知错误'));
  }
  return false; // 阻止 Upload 组件默认上传
};

// 选择标准数据文件
const handleStandardBeforeUpload = (file: UploadFile) => {
  standardFileList.value = [file];
  return false; // 阻止自动上传，等待手动提交
};

const handleStandardRemove = () => {
  standardFileList.value = [];
  return true;
};

// 手动提交标准数据
const handleStandardUpload = async () => {
  const file = standardFileList.value[0];
  if (!file) {
    message.warning('请先选择标准数据文件');
    return;
  }
  await doUpload(file, 0, () => {
    standardFileList.value = [];
    // 移除 loadStandardData() 调用，让 fetchPerformanceAccuracy() 自动更新数据
  });
  // 上传成功后，等待 fetchPerformanceAccuracy() 完成，图表会自动更新
};

// 选择测试数据文件
const handleTestBeforeUpload = (file: UploadFile) => {
  testFileList.value = [file];
  return false; // 阻止自动上传，等待手动提交
};

const handleTestRemove = () => {
  testFileList.value = [];
  return true;
};

// 手动提交测试数据
const handleTestUpload = async () => {
  const file = testFileList.value[0];
  if (!file) {
    message.warning('请先选择测试数据文件');
    return;
  }
  await doUpload(file, 1, () => {
    testFileList.value = [];
    // 移除 loadTestData() 调用，让 fetchPerformanceAccuracy() 自动更新数据
  });
  // 上传成功后，等待 fetchPerformanceAccuracy() 完成，图表会自动更新
};

// 加载标准数据（使用固定示例数据，x 为时间，y 为标准值）
const loadStandardData = () => {
  const points = 50;
  const timeStep = 0.5;
  const base = 300;

  standardDataList.value = Array.from({ length: points }).map((_, index) => {
    const t = (index + 1) * timeStep;
    const value = 230 + (base - 230) * (1 - Math.exp(-index / 10));
    return {
      key: index,
      time: t.toFixed(1),
      standard: value.toFixed(2),
    };
  });

  syncCurves();
};

const loadTestData = () => {
  const points = standardDataList.value.length || 50;
  const timeStep = 0.5;

  testDataList.value = Array.from({ length: points }).map((_, index) => {
    const t = (index + 1) * timeStep;
    const std = standardDataList.value[index]
      ? parseFloat(standardDataList.value[index].standard)
      : 230 + (300 - 230) * (1 - Math.exp(-index / 10));
    // 让测试值在标准值上下明显偏离（±5~±15）
    const jitter = (Math.random() - 0.5) * 20; // -10 ~ 10
    const value = std + jitter;
    return {
      key: index,
      time: t.toFixed(1),
      test: value.toFixed(2),
    };
  });

  syncCurves();
};

// 将当前标准/测试数据同步到 6 个曲线（暂用同一套数据填充）
const syncCurves = () => {
  if (standardDataList.value.length === 0 || testDataList.value.length === 0) {
    curveList.value = curveList.value.map(() => emptyCurve());
    cachedCurveData.value = JSON.parse(JSON.stringify(curveList.value));
    renderCurves();
    return;
  }

  const time: number[] = [];
  const standard: number[] = [];
  const test: number[] = [];
  const diff: number[] = [];

  const minLength = Math.min(standardDataList.value.length, testDataList.value.length);
  for (let i = 0; i < minLength; i++) {
    const stdVal = parseFloat(standardDataList.value[i].standard);
    const testVal = parseFloat(testDataList.value[i].test);
    time.push(parseFloat(standardDataList.value[i].time));
    standard.push(stdVal);
    test.push(testVal);
    diff.push(Math.abs(testVal - stdVal));
  }

  curveList.value = curveList.value.map(() => ({
    time,
    standard,
    test,
    diff,
  }));

  // 更新缓存数据
  cachedCurveData.value = JSON.parse(JSON.stringify(curveList.value));
  renderCurves();
};

// 渲染 6 个曲线
const renderCurves = () => {
  nextTick(() => {
    chartRenderers.value.forEach((renderer, idx) => {
      const data = curveList.value[idx] || emptyCurve();
      if (data.time.length > 0 || data.standard.length > 0 || data.test.length > 0) {
        renderSingleChart(renderer, data);
      }
    });
  });
};

// 查看详情
const handleViewDetail = (record: any, type: 'standard' | 'test') => {
  detailModalTitle.value = type === 'standard' ? '标准数据详情' : '测试数据详情';
  // TODO: 调用API获取详细数据
  detailModalData.value = [record];
  detailModalVisible.value = true;
};

// 计算评估
const handleEvaluate = async () => {
  if (!selectedAlgorithmId.value) {
    message.warning('请先选择算法');
    return;
  }
  if (standardDataList.value.length === 0) {
    message.warning('请先上传标准数据');
    return;
  }
  if (testDataList.value.length === 0) {
    message.warning('请先上传测试数据');
    return;
  }

  // TODO: 调用API进行计算
  message.loading('正在计算评估分数...', 0);
  
  // 模拟计算，取第一个曲线数据
  setTimeout(() => {
    const firstCurve = curveList.value[0] || emptyCurve();
    const diffs = firstCurve.diff || [];
    const score = 0.999692; // 模拟计算结果
    const maxDiff = diffs.length ? Math.max(...diffs) : null;
    const avgDiff = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : null;
    const minDiff = diffs.length ? Math.min(...diffs) : null;

    compareValues.value = {
      score,
      maxDiff,
      avgDiff,
      minDiff,
    };

    message.destroy();
    message.success('评估计算完成');
  }, 1000);
};

watch(selectedAlgorithmId, (val) => {
  if (val) {
    fetchPerformanceAccuracy();
  }
});

const renderHeightChart = (
  refObj: any,
  data: { heights: string[]; standard: (number | null)[]; test: (number | null)[] },
  title: string,
) => {
  const el = (refObj as any)?.value?.$el || (refObj as any)?.$el || (refObj as any)?.value || refObj;
  if (!el) {
    nextTick(() => renderHeightChart(refObj, data, title));
    return;
  }

  const heights = data.heights || [];
  const standard = heights.map((_, idx) => data.standard[idx] ?? null);
  const test = heights.map((_, idx) => data.test[idx] ?? null);
  const diff = heights.map((_, idx) => {
    const s = standard[idx];
    const t = test[idx];
    return s != null && t != null ? Math.abs(Number(t) - Number(s)) : null;
  });

  const option = {
    grid: { bottom: 50, containLabel: true, left: '3%', right: '3%', top: '8%' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['标准数据', '测试数据', '偏差'], bottom: 6 },
    xAxis: { type: 'category', boundaryGap: false, data: heights.map((h) => `${h}m`), name: '高度' },
    yAxis: { type: 'value', name: title },
    series: [
      { name: '标准数据', type: 'line', smooth: true, data: standard, itemStyle: { color: '#1890ff' } },
      { name: '测试数据', type: 'line', smooth: true, data: test, itemStyle: { color: '#52c41a' } },
      { name: '偏差', type: 'line', smooth: true, data: diff, itemStyle: { color: '#ff4d4f' } },
    ],
  };

  const echartsInstance = (echartsLib as any);
  if (!echartsInstance || !echartsInstance.init) return;
  const chart = echartsInstance.getInstanceByDom(el) || echartsInstance.init(el);
  chart.setOption(option, true);
  setTimeout(() => {
    try {
      chart.resize();
    } catch {}
  }, 0);
};

// 放大模式下渲染高度维度图表
const renderEnlargeHeightChart = () => {
  const el =
    (enlargeChartRef as any)?.value?.$el ||
    (enlargeChartRef as any)?.$el ||
    (enlargeChartRef as any)?.value ||
    enlargeChartRef.value;
  if (!el) {
    nextTick(() => renderEnlargeHeightChart());
    return;
  }

  const isSpeed = enlargeHeightType.value === 'max_speed';
  const data = isSpeed ? maxSpeedChartData.value : maxAccelerationChartData.value;
  const heights = data.heights || [];
  const standard = heights.map((_, idx) => data.standard[idx] ?? null);
  const test = heights.map((_, idx) => data.test[idx] ?? null);
  const diff = heights.map((_, idx) => {
    const s = standard[idx];
    const t = test[idx];
    return s != null && t != null ? Math.abs(Number(t) - Number(s)) : null;
  });

  const option = {
    grid: { bottom: 50, containLabel: true, left: '3%', right: '3%', top: '8%' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['标准数据', '测试数据', '偏差'], bottom: 6 },
    xAxis: { type: 'category', boundaryGap: false, data: heights.map((h) => `${h}m`), name: '高度' },
    yAxis: { type: 'value', name: isSpeed ? '速度' : '加速度' },
    series: [
      { name: '标准数据', type: 'line', smooth: true, data: standard, itemStyle: { color: '#1890ff' } },
      { name: '测试数据', type: 'line', smooth: true, data: test, itemStyle: { color: '#52c41a' } },
      { name: '偏差', type: 'line', smooth: true, data: diff, itemStyle: { color: '#ff4d4f' } },
    ],
  };

  const echartsInstance = (echartsLib as any);
  if (!echartsInstance || !echartsInstance.init) return;
  const chart = echartsInstance.getInstanceByDom(el) || echartsInstance.init(el);
  chart.setOption(option, true);
};

// 监听窗口尺寸变化，保持高度维度图表自适应
const resizeHeightCharts = () => {
  const echartsInstance = (echartsLib as any);
  if (!echartsInstance || !echartsInstance.getInstanceByDom) return;
  const refs = [maxSpeedChartRef, maxAccelerationChartRef];
  refs.forEach((refObj) => {
    const el = (refObj as any)?.value?.$el || (refObj as any)?.$el || (refObj as any)?.value || refObj;
    if (!el) return;
    const inst = echartsInstance.getInstanceByDom(el);
    if (inst?.resize) inst.resize();
  });
};

// 监听放大弹窗打开和 ref 绑定，确保图表正确渲染
watch([enlargeVisible, enlargeChartRef], ([visible, ref]) => {
  console.log('[放大图表] watch 触发，visible:', visible, 'ref:', ref, 'enlargeIndex:', enlargeIndex.value);
  const ready =
    visible &&
    ref &&
    ((enlargeMode.value === 'curve' && enlargeIndex.value !== null) ||
      (enlargeMode.value === 'height' && enlargeHeightType.value !== null));

  if (ready) {
    console.log('[放大图表] watch 条件满足，准备渲染');
    // 延迟渲染，确保 DOM 完全准备好
    nextTick(() => {
      console.log('[放大图表] watch nextTick 回调执行');
      setTimeout(() => {
        console.log('[放大图表] watch setTimeout 回调执行');
        if (enlargeMode.value === 'height') {
          renderEnlargeHeightChart();
        } else {
          renderEnlargeChart();
        }
      }, 150); // 增加延迟，确保 Modal 完全打开
    });
  } else {
    console.log('[放大图表] watch 条件不满足，不渲染');
  }
}, { deep: true });

onMounted(() => {
  loadAlgorithmList();
  fetchPerformanceAccuracy();
  window.addEventListener('resize', resizeHeightCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHeightCharts);
});
</script>

<template>
  <div class="w-full h-full p-5 bg-gray-50">
    <a-row :gutter="16" class="h-full">
      <!-- 左侧区域：曲线图和对比值 -->
      <a-col :span="16" class="h-full flex flex-col">
        <!-- 6 个曲线图 -->
        <a-card title="曲线图展示" class="flex-1 mb-4" :body-style="{ height: 'calc(100% - 57px)', overflow: 'auto' }">
          <a-row :gutter="8">
            <a-col :span="12" v-for="(renderer, idx) in chartRenderers" :key="renderer.id" class="mb-2">
              <a-card
                :title="renderer.title"
                size="small"
                :body-style="{ height: '290px', padding: '6px' }"
              >
                <div class="h-full relative">
                  <a-button
                    type="text"
                    size="small"
                    class="absolute right-1 top-1 z-10"
                    @click.stop="openEnlarge(idx)"
                  >
                    <ZoomInOutlined />
                  </a-button>
                  <EchartsUI
                    :key="`chart-${renderer.id}-${curveList[idx]?.standard?.length}-${curveList[idx]?.test?.length}`"
                    :ref="renderer.bindRef"
                    class="h-full"
                    style="width: 100%; height: 100%;"
                  />
                  <div
                    v-if="!(curveList[idx]?.standard?.length || curveList[idx]?.test?.length)"
                    class="absolute inset-0 flex items-center justify-center text-gray-400 bg-white/80 text-xs"
                  >
                    请上传标准数据和测试数据以显示图表
                  </div>
                </div>
              </a-card>
            </a-col>
            <!-- 高度维度：最大速度 -->
            <a-col :span="12" class="mb-2">
              <a-card
                title="最大速度"
                size="small"
                :body-style="{ height: '260px', padding: '6px' }"
              >
                <div class="h-full relative">
                  <a-button
                    type="text"
                    size="small"
                    class="absolute right-1 top-1 z-10"
                    @click.stop="openEnlargeHeight('max_speed')"
                  >
                    <ZoomInOutlined />
                  </a-button>
                  <EchartsUI
                    ref="maxSpeedChartRef"
                    class="h-full"
                    style="width: 100%; height: 100%;"
                  />
                  <div
                    v-if="!(maxSpeedChartData.standard?.length || maxSpeedChartData.test?.length)"
                    class="absolute inset-0 flex items-center justify-center text-gray-400 bg-white/80 text-xs"
                  >
                    请上传标准数据和测试数据以显示图表
                  </div>
                </div>
              </a-card>
            </a-col>
            <!-- 高度维度：最大加速度 -->
            <a-col :span="12" class="mb-2">
              <a-card
                title="最大加速度"
                size="small"
                :body-style="{ height: '260px', padding: '6px' }"
              >
                <div class="h-full relative">
                  <a-button
                    type="text"
                    size="small"
                    class="absolute right-1 top-1 z-10"
                    @click.stop="openEnlargeHeight('max_acceleration')"
                  >
                    <ZoomInOutlined />
                  </a-button>
                  <EchartsUI
                    ref="maxAccelerationChartRef"
                    class="h-full"
                    style="width: 100%; height: 100%;"
                  />
                  <div
                    v-if="!(maxAccelerationChartData.standard?.length || maxAccelerationChartData.test?.length)"
                    class="absolute inset-0 flex items-center justify-center text-gray-400 bg-white/80 text-xs"
                  >
                    请上传标准数据和测试数据以显示图表
                  </div>
                </div>
              </a-card>
            </a-col>
          </a-row>
        </a-card>

      </a-col>

      <!-- 右侧区域：算法信息和数据列表 -->
      <a-col :span="8" class="h-full flex flex-col">
        <!-- 算法相关信息 -->
        <a-card title="算法相关信息" class="mb-4">
          <div class="space-y-4">
            <div>
              <label class="block mb-2 text-sm font-medium">选择算法：</label>
              <template v-if="algorithmLoaded">
                <a-select
                  v-model:value="selectedAlgorithmId"
                  placeholder="请选择算法"
                  class="w-full"
                  :options="algorithmOptions"
                />
              </template>
              <template v-else>
                <a-skeleton active :paragraph="{ rows: 1, width: '100%' }" :title="false" />
              </template>
            </div>
            <div v-if="selectedAlgorithm?.type">
              <label class="block mb-2 text-sm font-medium">算法类型：</label>
              <div class="p-2 bg-gray-50 rounded text-sm">
                {{ selectedAlgorithm.type }}
              </div>
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium">上传数据：</label>
              <a-space direction="vertical" class="w-full">
                <a-upload
                  :file-list="standardFileList"
                  :before-upload="handleStandardBeforeUpload"
                  :on-remove="handleStandardRemove"
                  accept=".xlsx,.xls"
                  :max-count="1"
                >
                  <a-button>
                    <template #icon><UploadOutlined /></template>
                    选择标准数据
                  </a-button>
                </a-upload>
                <a-button type="primary" ghost @click="handleStandardUpload" :disabled="!standardFileList.length">
                  上传标准数据
                </a-button>
                <a-upload
                  :file-list="testFileList"
                  :before-upload="handleTestBeforeUpload"
                  :on-remove="handleTestRemove"
                  accept=".xlsx,.xls"
                  :max-count="1"
                >
                  <a-button>
                    <template #icon><UploadOutlined /></template>
                    选择测试数据
                  </a-button>
                </a-upload>
                <a-button type="primary" ghost @click="handleTestUpload" :disabled="!testFileList.length">
                  上传测试数据
                </a-button>
              </a-space>
            </div>
          </div>
        </a-card>

        <!-- 标准数据列表
        <a-card title="标准数据列表【可点详情查看列表数据】" class="mb-4 flex-1" :body-style="{ height: 'calc(100% - 57px)', overflow: 'auto' }">
          <a-table
            :columns="standardColumns"
            :data-source="standardDataList"
            :pagination="{ pageSize: 5, size: 'small' }"
            size="small"
            :scroll="{ y: 200 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small" @click="handleViewDetail(record, 'standard')">
                  详情
                </a-button>
              </template>
            </template>
          </a-table>
        </a-card>

        测试数据列表
        <a-card title="测试数据列表【可点详情查看列表数据】" class="mb-4 flex-1" :body-style="{ height: 'calc(100% - 57px)', overflow: 'auto' }">
          <a-table
            :columns="testColumns"
            :data-source="testDataList"
            :pagination="{ pageSize: 5, size: 'small' }"
            size="small"
            :scroll="{ y: 200 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small" @click="handleViewDetail(record, 'test')">
                  详情
                </a-button>
              </template>
            </template>
          </a-table>
        </a-card> -->

        <!-- 算法数据对比表 -->
        <a-card :title="selectedAlgorithmType ? `${algorithmTypeMap[selectedAlgorithmType.toLowerCase().replace(/\s+/g, '_')] || selectedAlgorithmType}数据对比表` : '算法数据对比表'" class="mb-4 flex-1" :body-style="{ height: 'calc(100% - 57px)', overflow: 'auto' }">
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium">选择算法类型：</label>
            <a-select
              v-model:value="selectedAlgorithmType"
              placeholder="请选择算法类型"
              class="w-full max-w-xs"
              :options="algorithmTypeOptions"
              :disabled="algorithmTypeOptions.length === 0"
            />
          </div>
          <a-table
            v-if="selectedAlgorithmType"
            :columns="fuelConsumptionColumns"
            :data-source="fuelConsumptionTableData"
            :pagination="{ pageSize: 10, size: 'small' }"
            size="small"
            :scroll="{ x: 1200, y: 300 }"
            bordered
          />
          <a-empty v-else description="请先选择算法类型" />
        </a-card>

        <!-- 最大速度 / 最大加速度 数据对比表（参考耗油率样式） -->
        <a-card title="最大速度 / 最大加速度 数据对比表" class="mb-4 flex-1" :body-style="{ height: 'calc(100% - 57px)', overflow: 'auto' }">
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium">选择算法类型：</label>
            <a-select
              v-model:value="maxDataSelect"
              class="w-full max-w-xs"
              :options="maxDataOptions"
            />
          </div>

          <template v-if="maxDataSelect === 'max_speed'">
            <div class="font-semibold mb-2">标准数据</div>
            <a-table
              :columns="sixHeightColumns"
              :data-source="maxSpeedStandardTable"
              size="small"
              :pagination="false"
              :scroll="{ x: 900, y: 150 }"
              bordered
            />
            <div class="font-semibold mt-3 mb-2">测试数据</div>
            <a-table
              :columns="sixHeightColumns"
              :data-source="maxSpeedTestTable"
              size="small"
              :pagination="false"
              :scroll="{ x: 900, y: 150 }"
              bordered
            />
            <div class="font-semibold mt-3 mb-2">分数（×100，四位小数，%）</div>
            <a-table
              :columns="sixHeightColumns"
              :data-source="maxSpeedScoreTable"
              size="small"
              :pagination="false"
              :scroll="{ x: 900 }"
              bordered
            />
          </template>

          <template v-else>
            <div class="font-semibold mb-2">标准数据</div>
            <a-table
              :columns="sixHeightColumns"
              :data-source="maxAccelerationStandardTable"
              size="small"
              :pagination="false"
              :scroll="{ x: 900, y: 150 }"
              bordered
            />
            <div class="font-semibold mt-3 mb-2">测试数据</div>
            <a-table
              :columns="sixHeightColumns"
              :data-source="maxAccelerationTestTable"
              size="small"
              :pagination="false"
              :scroll="{ x: 900, y: 150 }"
              bordered
            />
            <div class="font-semibold mt-3 mb-2">分数（×100，四位小数，%）</div>
            <a-table
              :columns="sixHeightColumns"
              :data-source="maxAccelerationScoreTable"
              size="small"
              :pagination="false"
              :scroll="{ x: 900 }"
              bordered
            />
          </template>
        </a-card>

        <!-- 评估按钮 -->
        <a-card class="mb-0">
          <a-button
            type="primary"
            block
            size="large"
            @click="handleEvaluate"
            :disabled="!selectedAlgorithmId || standardDataList.length === 0 || testDataList.length === 0"
          >
            <template #icon><CalculatorOutlined /></template>
            评估
          </a-button>
        </a-card>
      </a-col>
    </a-row>

    <!-- 详情模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      :title="detailModalTitle"
      width="800px"
      :footer="null"
    >
      <a-table
        :columns="detailModalTitle.includes('标准') ? standardColumns : testColumns"
        :data-source="detailModalData"
        :pagination="false"
        size="small"
      />
    </a-modal>

    <!-- 放大查看曲线 -->
    <a-modal
      v-model:open="enlargeVisible"
      :title="enlargeTitle"
      width="900px"
      :destroyOnClose="true"
      @cancel="closeEnlarge"
      @afterOpenChange="handleEnlargeAfterOpenChange"
      :footer="null"
    >
      <div
        v-if="(enlargeMode === 'curve' && enlargeIndex !== null) || (enlargeMode === 'height' && enlargeHeightType)"
        style="height: 480px;"
      >
        <EchartsUI 
          :key="`enlarge-${enlargeIndex}-${enlargeChartKey}`"
          ref="enlargeChartRef" 
          @vue:mounted="() => console.log('[放大图表] EchartsUI mounted, ref:', enlargeChartRef)"
          @vue:updated="() => console.log('[放大图表] EchartsUI updated, ref:', enlargeChartRef)"
          style="height: 100%; width: 100%;" 
        />
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
:deep(.ant-card-head-title) {
  font-weight: 600;
}

:deep(.ant-card-body) {
  padding: 16px;
}
</style>

