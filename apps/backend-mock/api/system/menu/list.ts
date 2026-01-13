import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";
import {unAuthorizedResponse} from "~/utils/response";
import {handleTree} from "~/api/utils";

function listMenu(event: H3Event<EventHandlerRequest>, query: any) {
  return request({
    url: '/system/menu/list',
    method: 'get',
    params: query,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}


export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const res = await listMenu(event, {
    pageNum: Number(query.pageNum ?? 1),
    pageSize: Number(query.pageSize ?? 10),
    menuName: query.menuName ?? null,
  })
  if (res.code === 401) {
    return unAuthorizedResponse(event)
  }
  if (res.code === -1) {
    return useResponseError(res.code, res.error, res.message)
  }
  return useResponseSuccess({
    ...res,
    menuTree: handleTree(res.data.filter(item => !item.menuName.includes('若依官网')).map(item => {
      return {
        ...item,
        key: item.menuId
      }
    }), "menuId"),
  })
})
