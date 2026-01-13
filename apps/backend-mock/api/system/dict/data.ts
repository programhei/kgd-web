import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";

function getDictData(event: H3Event<EventHandlerRequest>, dictType: string) {
  return request({
    url: '/system/dict/data/type/' + dictType,
    method: 'get',
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}


export default defineEventHandler(async (event) => {
  const {dictType} = getQuery(event);
  const res = await getDictData(event, dictType)
  return useResponseSuccess(res)
})
