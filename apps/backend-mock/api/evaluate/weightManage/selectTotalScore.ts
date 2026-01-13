import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";
import {unAuthorizedResponse} from "~/utils/response";
import {handleTree} from "~/api/utils";

function selectTotalScore(event: H3Event<EventHandlerRequest>, query: any) {

  return request({
    url: '/evaluate/weightManage/selectTotalScore',
    method: 'post',
    params: query,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}


export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const res = await selectTotalScore(event, {
    groupId: query.groupId
  })

  if (res.code === 401) {
    return unAuthorizedResponse(event)
  }
  if (res.code === -1) {
    return useResponseError(res.code, res.error, res.message)
  }

  return useResponseSuccess({
    ...res,
    treeData:res,
  })

})
