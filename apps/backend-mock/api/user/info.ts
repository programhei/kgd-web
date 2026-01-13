import request from '../../utils/request'
import {getRefreshTokenFromCookie} from '~/utils/cookie-utils'

function getUserInfo(event) {
  return request({
    url: '/getInfo',
    method: 'get',
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

export default eventHandler(async (event) => {
  const res = await getUserInfo(event)
  return useResponseSuccess({...res})
})
