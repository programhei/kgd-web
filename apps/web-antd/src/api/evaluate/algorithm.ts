import { RequestClient } from '@vben/request';
import { useAccessStore } from '@vben/stores';
import { preferences } from '@vben/preferences';

// 单独为算法模块创建直连后端的 client，避免经过 mock 服务
// 后端端口：8099，直接访问应用根路径
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

// 后端 Controller 映射：@RequestMapping(\"/evaluate/algorithm\")
const API_PREFIX = '/evaluate/algorithm';

export async function listAlgorithm(query?: any) {
  return algorithmClient.get(`${API_PREFIX}/list`, {
    params: query,
  });
}

export async function getAlgorithm(id: number) {
  return algorithmClient.get(`${API_PREFIX}/${id}`);
}

export async function addAlgorithm(data: any) {
  return algorithmClient.post(API_PREFIX, data);
}

export async function updateAlgorithm(data: any) {
  return algorithmClient.put(API_PREFIX, data);
}

export async function deleteAlgorithm(ids: number[] | number) {
  const idPath = Array.isArray(ids) ? ids.join(',') : ids;
  return algorithmClient.delete(`${API_PREFIX}/${idPath}`);
}

