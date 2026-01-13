import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";
import {unAuthorizedResponse} from "~/utils/response";

function listRole(event: H3Event<EventHandlerRequest>, query: any) {
  return request({
    url: '/system/role/list',
    method: 'get',
    params: query,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}


export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const res = await listRole(event, {
    pageNum: Number(query.pageNum ?? 1),
    pageSize: Number(query.pageSize ?? 10),
    roleName: query.roleName ?? null,
  })
  if (res.code === 401) {
    return unAuthorizedResponse(event)
  }
  if (res.code === -1) {
    return useResponseError(res.code, res.error, res.message)
  }
  return useResponseSuccess(res)
})
