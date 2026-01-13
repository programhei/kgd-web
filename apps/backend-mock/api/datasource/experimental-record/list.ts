import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";
import {unAuthorizedResponse} from "~/utils/response";
import {handleTree} from "~/api/utils";

function listExperimentalRecord(event: H3Event<EventHandlerRequest>, query: any) {
  return request({
    url: '/datasource/experimentalRecord/list',
    method: 'get',
    params: query,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}


export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const res = await listExperimentalRecord(event, {
    pageNum: Number(query.pageNum ?? 1),
    pageSize: Number(query.pageSize ?? 10),
    ...query
  })
  if (res.code === 401) {
    return unAuthorizedResponse(event)
  }
  if (res.code === -1) {
    return useResponseError(res.code, res.error, res.message)
  }
  return useResponseSuccess(res)
})
