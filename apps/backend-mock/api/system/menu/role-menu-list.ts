import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";
import {unAuthorizedResponse} from "~/utils/response";

function roleMenuList(event: H3Event<EventHandlerRequest>, roleId: any) {
  return request({
    url: '/system/menu/roleMenuTreeselect/' + roleId,
    method: 'get',
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}


export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const res = await roleMenuList(event, body.roleId)
  if (res.code === 401) return unAuthorizedResponse(event)
  if (res.code === -1) return useResponseError(res.code, res.error, res.message)
  return useResponseSuccess(res)
})
