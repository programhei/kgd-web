import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";
import {unAuthorizedResponse} from "~/utils/response";

function getMissileTrajectory(event: H3Event<EventHandlerRequest>, query?: any) {
  return request({
    url: '/datasource/weight/missileTrajectory',
    method: 'post',
    params: query,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const res: any = await getMissileTrajectory(event, query)
  if (res.code === 401) {
    return unAuthorizedResponse(event)
  }
  if (res.code === -1) {
    return useResponseError(res.code, res.error, res.message)
  }
  return useResponseSuccess(res)
})










