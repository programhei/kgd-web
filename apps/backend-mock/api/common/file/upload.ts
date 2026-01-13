// 文件上传
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import {unAuthorizedResponse} from "~/utils/response";
import request from "~/utils/request";
import type {EventHandlerRequest, H3Event} from "h3";

function upload(event: H3Event<EventHandlerRequest>, fileItem: any) {
  return request({
    url: '/common/uploadFile',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`,
      'Content-Type': 'application/octet-stream', // 关键：二进制流
    },
    params: {filename: fileItem.filename}, // 查询参数
    data: fileItem.data,
  })
}

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  const fileItem = formData.find(f => f.name === 'file')
  if (!fileItem) return useResponseError(400, '文件缺失', new Error('文件缺失'))
  // 直接返回文件信息，不转上游
  const res = await upload(event, fileItem)
  if (res.code === 401) return unAuthorizedResponse(event)
  if (res.code === -1) return useResponseError(res.code, res.error, res.message)
  return useResponseSuccess(res)
})
