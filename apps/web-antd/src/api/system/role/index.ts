import {requestClient} from '#/api/request';

export async function listRole(query: any) {
  return requestClient.get('/system/role/list', {
    params: query
  });
}

export async function addRole(data: any) {
  return requestClient.post('/system/role/add', data);
}


export async function delRole(data: any) {
  return requestClient.post('/system/role/delete', data);
}

export async function getRoleInfo(data: any) {
  return requestClient.post('/system/role/info', data);
}

export async function updateRole(data: any) {
  return requestClient.post('/system/role/update', data);
}
