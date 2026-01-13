import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";
import {unAuthorizedResponse} from "~/utils/response";

function uploadMissileTrajectory(event: H3Event<EventHandlerRequest>, path: string, flag: number) {
  return request({
    url: '/datasource/weight/uploadMissileTrajectory',
    method: 'post',
    params: { path, flag },
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData) {
    return useResponseError(400, '参数缺失', new Error('请求参数缺失'))
  }
  
  // 获取 path 和 flag 参数
  const pathItem = formData.find(f => f.name === 'path')
  const flagItem = formData.find(f => f.name === 'flag')
  
  if (!pathItem || !flagItem) {
    return useResponseError(400, '参数缺失', new Error('path 和 flag 参数必填'))
  }
  
  const path = pathItem.data.toString('utf-8')
  const flag = parseInt(flagItem.data.toString('utf-8'), 10)
  
  if (isNaN(flag)) {
    return useResponseError(400, '参数错误', new Error('flag 必须是数字'))
  }
  
  const res: any = await uploadMissileTrajectory(event, path, flag)
  if (res.code === 401) return unAuthorizedResponse(event)
  if (res.code === -1) return useResponseError(res.code, res.error, res.message)
  return useResponseSuccess(res)
})

