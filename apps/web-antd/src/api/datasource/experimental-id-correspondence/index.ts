import {requestClient} from '#/api/request';

// 查询实验ID对应表数据
export async function listExperimentalIdCorrespondence(query: any) {
  return requestClient.get('/datasource/experimental-id-correspondence/list', {
    params: query
  });
}


// 删除实验ID对应表
export async function deleteExperimentalIdCorrespondence(data: any) {
  return requestClient.post('/datasource/experimental-id-correspondence/delete', data);
}

