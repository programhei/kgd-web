import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";
import {unAuthorizedResponse} from "~/utils/response";

function clearWeight(event: H3Event<EventHandlerRequest>) {
  return request({
    url: '/datasource/weight/deleteWeight',
    method: 'delete',
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}


export default defineEventHandler(async (event) => {
  const res: any = await clearWeight(event)
  if (res.code === 401) return unAuthorizedResponse(event)
  if (res.code === -1) return useResponseError(res.code, res.error, res.message)
  return useResponseSuccess(res)
})
