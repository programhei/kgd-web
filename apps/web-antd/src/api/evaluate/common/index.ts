import {requestClient} from '#/api/request';

// 导入评估数据
export async function importData(query: any) {
  return requestClient.get('/evaluate/common/import-data', {
    params: query
  });
}

// 查询评估数据列表
export async function list(query: any) {
  return requestClient.get('/evaluate/common/list', {
    params: query
  });
}

// 删除评估数据列表
export async function deleteData(data: any) {
  return requestClient.post('/evaluate/common/delete', data);
}


// 评估数据
export async function evaluateData(data: any) {
  return requestClient.post('/evaluate/common/evaluate', data);
}

// 评估软件质量
export async function evaluateSoftwareQuality(data: any) {
  return requestClient.post('/evaluate/common/evaluateSoftwareQuality', data);
}


