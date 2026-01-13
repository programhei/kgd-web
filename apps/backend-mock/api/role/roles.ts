import request from '../../utils/request'

function roles(query) {
  return request({
    url: '/roles',
    method: 'post',
    data: query
  })
}


export default defineEventHandler((event) => {
  return readBody(event).then(({ roleName, roleKey, status }) =>
    roles({
      roleName: roleName ?? undefined,
      roleKey:  roleKey  ?? undefined,
      status:  status   ?? undefined
    })
  ).then((res) => {
    return useResponseSuccess(res.data)
  })
})
