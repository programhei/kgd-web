import type {RoleInfo} from '@vben/types';

import {baseRequestClient, requestClient} from '#/api/request';

/**
 * 获取用户信息
 */
export async function getRolesApi() {

  return requestClient.post('/role/roles',{});
}
