import {requestClient} from '#/api/request';

export async function listMenu(query: any) {
  return requestClient.get('/system/menu/list', {
    params: query
  });
}

export async function addMenu(data: any) {
  return requestClient.post('/system/menu/add', data);
}


export async function delMenu(data: any) {
  return requestClient.post('/system/menu/delete', data);
}

export async function getMenuInfo(data: any) {
  return requestClient.post('/system/menu/info', data);
}

export async function updateMenu(data: any) {
  return requestClient.post('/system/menu/update', data);
}

export async function treeList() {
  return requestClient.get('/system/menu/tree-list');
}

export async function roleTreeList(roleId) {
  return requestClient.post('/system/menu/role-menu-list', {
    roleId
  });
}


