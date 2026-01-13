import {requestClient} from '#/api/request';


export async function listLoginLogs(query: any) {
  return requestClient.get('/system/system-logs/login-logs/list', {
    params: query
  });
}


export async function delLoginLog(data: any) {
  return requestClient.post('/system/system-logs/login-logs/delete', data);
}

export async function cleanLoginLogs(data: any) {
  return requestClient.post('/system/system-logs/login-logs/clean', data);
}



