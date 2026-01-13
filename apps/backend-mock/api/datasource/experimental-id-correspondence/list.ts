import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";
import {unAuthorizedResponse} from "~/utils/response";
import {handleTree} from "~/api/utils";

function listExperimentalIdCorrespondence(event: H3Event<EventHandlerRequest>, query: any) {
  return request({
    url: '/datasource/experimentalIdCorrespondence/list',
    method: 'get',
    params: query,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}


export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const res = await listExperimentalIdCorrespondence(event, {
    pageNum: Number(query.pageNum ?? 1),
    pageSize: Number(query.pageSize ?? 10),
    weightType: query.weightType
  })
  if (res.code === 401) {
    return unAuthorizedResponse(event)
  }
  if (res.code === -1) {
    return useResponseError(res.code, res.error, res.message)
  }
  return useResponseSuccess({
    ...res,
    treeData: handleTree(res.rows.map(item => {
      return {
        ...item,
        key: item.id,
      }
    }), "digitalId"),
  })

})
