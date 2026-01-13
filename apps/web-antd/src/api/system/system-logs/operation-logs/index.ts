import {requestClient} from '#/api/request';


export async function listOperaLogs(query: any) {
  return requestClient.get('/system/system-logs/opera-logs/list', {
    params: query
  });
}


export async function delOperaLog(data: any) {
  return requestClient.post('/system/system-logs/opera-logs/delete', data);
}

export async function cleanOperaLogs(data: any) {
  return requestClient.post('/system/system-logs/opera-logs/clean', data);
}





