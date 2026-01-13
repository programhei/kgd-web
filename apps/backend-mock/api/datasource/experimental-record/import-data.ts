import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";
import {unAuthorizedResponse} from "~/utils/response";
import {Axios, AxiosResponse} from "axios";

// 导入实验数据
function importData(event: H3Event<EventHandlerRequest>, path: any) {
  return request({
    url: '/datasource/experimentalRecord/importData',
    method: 'get',
    params: {path},
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}


export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const {filePath} = query
  if (!filePath) {
    return useResponseError(-1, '参数丢失', 'filePath 必填')
  }
  try {
    const res: any = await importData(event, filePath)
    if (res.code === 401) return unAuthorizedResponse(event)
    if (res.code === -1) return useResponseError(res.code, res.error, res.message)
    return useResponseSuccess(res)
  } catch (err) {
    return useResponseError(-1, '系统错误', (err as Error).message)
  }
})
