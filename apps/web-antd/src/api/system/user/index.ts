import {requestClient} from '#/api/request';


export async function listUser(query: any) {
  return requestClient.get('/system/user/list', {
    params: query
  });
}

export async function addUser(data: any) {
  return requestClient.post('/system/user/add', data);
}


export async function delUser(data: any) {
  return requestClient.post('/system/user/delete', data);
}

export async function getUserInfo(data: any) {
  return requestClient.post('/system/user/info', data);
}

export async function updateUser(data: any) {
  return requestClient.post('/system/user/update', data);
}
