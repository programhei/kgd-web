import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from '~/utils/cookie-utils';
import {generateAccessToken, generateRefreshToken} from '~/utils/jwt-utils';
import {forbiddenResponse} from '~/utils/response';
import request from '../../utils/request'

function login(username, password, code, uuid) {
  const data = {
    username,
    password,
    code,
    uuid
  }
  return request({
    url: '/login',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: data
  })
}

export default defineEventHandler(async (event) => {
  const {password, username, code, uuid} = await readBody(event);
  if (!password || !username) {
    setResponseStatus(event, 400);
    return useResponseError(
      'BadRequestException',
      '请填写用户名和密码',
    );
  }
  // 登录接口
  const res = await login(
    username ?? undefined, password ?? undefined,
    code ?? undefined, uuid ?? undefined,
  )
  if (!res || res.code !== 200) {
    clearRefreshTokenCookie(event);
    return forbiddenResponse(event, '用户名或者密码不正确。');
  }
  // 用户信息
  const findUser = res.user.user
  // const accessToken = generateAccessToken(res.user.user);
  // 令牌
  const accessToken = res.token;
  // const refreshToken = generateRefreshToken(res.user.user);
  // 刷新令牌
  const refreshToken = res.token;
  //存储令牌
  setRefreshTokenCookie(event, refreshToken);
  return useResponseSuccess({
    user: findUser,
    token: accessToken,
  });
});
