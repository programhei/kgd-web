import {requestClient} from '#/api/request';

// 查询字典值列表
export async function getDictData(query: any) {
  return requestClient.get('/system/dict/data', {
    params: query
  });
}
