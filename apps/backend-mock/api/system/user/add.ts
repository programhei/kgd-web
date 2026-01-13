import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";
import {unAuthorizedResponse} from "~/utils/response";

function addUser(event: H3Event<EventHandlerRequest>, data: any) {
  return request({
    url: '/system/user',
    method: 'post',
    data: data,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}


export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const res = await addUser(event, {...body, deptId: 103})
  if (res.code === 401) return unAuthorizedResponse(event)
  if (res.code === -1) return useResponseError(res.code, res.error, res.message)
  return useResponseSuccess(res)
})
