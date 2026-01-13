import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";
import {unAuthorizedResponse} from "~/utils/response";
import {handleTree} from "~/api/utils";

function updateWeightTreeValue(event: H3Event<EventHandlerRequest>, query: any) {

  return request({
    url: '/evaluate/weightManage/saveWeight',
    method: 'post',
    params: query,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}


export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const res = await updateWeightTreeValue(event, {
    groupId: query.groupId,
    id: query.id,
    weight: query.weight
  })

  if (res.code === 401) {
    return unAuthorizedResponse(event)
  }
  if (res.code === -1) {
    return useResponseError(res.code, res.error, res.message)
  }

  return useResponseSuccess({
    ...res,
  })

})
