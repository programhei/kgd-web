import {requestClient} from '#/api/request';

// 查询实验记录数据
export async function listExperimentalRecord(query: any) {
  return requestClient.get('/datasource/experimental-record/list', {
    params: query
  });
}


// 导入实验记录数据
export async function importExperimentalRecord(query: any) {
  return requestClient.get('/datasource/experimental-record/import-data', {
    params: query
  });
}
// 导入AfSim实验记录数据
export async function importAfSimExperimentalRecord(query: any) {
  return requestClient.get('/datasource/experimental-record/import-afsim-data', {
    params: query
  });
}


// 删除实验数据列表
export async function deleteExperimentalRecord(data: any) {
  return requestClient.post('/datasource/experimental-record/delete', data);
}

// 删除实验数据列表
export async function clearExperimentalRecord() {
  return requestClient.post('/datasource/experimental-record/clear');
}

