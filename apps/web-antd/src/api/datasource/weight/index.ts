import {requestClient} from '#/api/request';

// 查询权值列表
export async function listWeight(query: any) {
  return requestClient.get('/datasource/weight/list', {
    params: query
  });
}

// 新增权值
export async function addWeight(data: any) {
  return requestClient.post('/datasource/weight/add', data);
}

// 删除权值
export async function delWeight(data: any) {
  return requestClient.post('/datasource/weight/delete', data);
}
// 清空权值
export async function clearWeight() {
  return requestClient.post('/datasource/weight/clear');
}

// 获取权值
export async function getWeightInfo(data: any) {
  return requestClient.post('/datasource/weight/info', data);
}

// 修改权值
export async function updateWeight(data: any) {
  return requestClient.post('/datasource/weight/update', data);
}

// 更新权值
export async function loadWeightData() {
  return requestClient.post('/datasource/weight/load-weight');
}

// 获取弹道精准度数据
export async function getMissileTrajectory(data?: any) {
  return requestClient.post('/datasource/weight/missileTrajectory', data);
}

// 上传弹道轨迹数据
export async function uploadMissileTrajectory(data: FormData) {
  return requestClient.post('/datasource/weight/uploadMissileTrajectory', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
