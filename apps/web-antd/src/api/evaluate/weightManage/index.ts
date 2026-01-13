import {requestClient} from '#/api/request';
import { RequestClient } from '@vben/request';
import { useAccessStore } from '@vben/stores';
import { preferences } from '@vben/preferences';
const algorithmClient = new RequestClient({
  baseURL: 'http://127.0.0.1:8099',
});
// 补上认证头，与全局 requestClient 保持一致，避免 401
function formatToken(token: null | string) {
  return token ? `Bearer ${token}` : null;
}

algorithmClient.addRequestInterceptor({
  fulfilled: async (config) => {
    const accessStore = useAccessStore();
    config.headers.Authorization = formatToken(accessStore.accessToken);
    config.headers['Accept-Language'] = preferences.app.locale;
    return config;
  },
});
algorithmClient.addResponseInterceptor({
  fulfilled: (response) => {
      const { data: responseData, status } = response;

      const { code, data } = (responseData || {}) as any;

      // 后端真实接口：code === 200 表示成功
      // Mock 接口：code === 0 表示成功
      // 有些接口可能不返回 code 字段，此时只要 HTTP 状态 2xx 也视为成功
      if (
        status >= 200 &&
        status < 400 &&
        (code === 0 || code === 200 || code === undefined)
      ) {
        // 如果有 data 字段就返回 data，否则返回整个响应体
        return data !== undefined ? data : (responseData as any);
      }

      throw Object.assign({}, response, { response });
    },
});

// 查询实验ID对应表数据
export async function selectWeightTree(query: any) {

  return requestClient.get('/evaluate/weightManage/list', {
    params: query
  });
}


// 删除实验ID对应表
export async function updateWeightTreeValue(query: any) {
  return requestClient.get('/evaluate/weightManage/update', {
    params: query
  });
}

// 删除实验ID对应表
export async function selectTotalScore(query: any) {
  return requestClient.get('/evaluate/weightManage/selectTotalScore', {
    params: query
  });
}

// 查询专家下拉框选项
export async function selectUserIds() {
  return algorithmClient.post('/evaluate/weightManage/selectUserIds', {});
}

// 融合数据
export async function countAvgWeightWithType() {
  return algorithmClient.post('/evaluate/weightManage/countAvgWeightWithType', {});
}

// 得分显示
export async function comprehensiveEvalua() {
  return algorithmClient.get('/datasource/weight/comprehensiveEvalua', {});
}


// 智能决策数据列表
export async function listIntelligentDecisions(params?: any) {
  return algorithmClient.get('/evaluate/common/listIntelligentDecisions', {
    params,
  });
}

// 智能决策数据列表
export async function listIntelligentDecision(params?: any) {
  return algorithmClient.get('/evaluate/common/listIntelligentDecision', {
    params,
  });
}