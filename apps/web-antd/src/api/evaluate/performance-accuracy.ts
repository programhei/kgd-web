import { RequestClient } from '@vben/request';
import { useAccessStore } from '@vben/stores';
import { preferences } from '@vben/preferences';

// 直连后端 8099，绕过 mock
function formatToken(token: null | string) {
  return token ? `Bearer ${token}` : null;
}

const perfClient = new RequestClient({
  baseURL: 'http://127.0.0.1:8099',
});

perfClient.addRequestInterceptor({
  fulfilled: async (config) => {
    const accessStore = useAccessStore();
    config.headers.Authorization = formatToken(accessStore.accessToken);
    config.headers['Accept-Language'] = preferences.app.locale;
    return config;
  },
});

// 通用上传（返回文件路径）
export async function uploadPerformanceFile(data: FormData) {
  return perfClient.post('/common/upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// 上传性能准确度数据
export async function uploadPerformanceAccuracy(data: FormData) {
  return perfClient.post('/datasource/weight/uploadPerformanceAccuracy', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// 查询性能准确度数据
export async function selectPerformanceAccuracy(payload: any) {
  return perfClient.post('/datasource/weight/selectPerformanceAccuracy', payload);
}


