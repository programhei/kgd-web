import axios from 'axios'
import cookies from './cache'
import {tansParams} from './index'
import errorCode from './error-code'

const instance = axios.create({
  baseURL: "http://127.0.0.1:8099",
  timeout: 10000
})

// request拦截器
instance.interceptors.request.use((config: any) => {
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false

  // 是否需要防止数据重复提交
  const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
  if (!config.headers.Authorization && !isToken) {
    // 让每个请求携带自定义token 请根据实际情况自行修改
    config.headers.Authorization = `Bearer ${cookies.cookies.getToken('jwt')}`
  }
  config.headers['Access-Control-Allow-Origin'] = '*'
  // get请求映射params参数
  if (config.method === 'get' && config.params) {
    let url = `${config.url}?${tansParams(config.params)}`
    url = url.slice(0, -1)
    config.params = {}
    config.url = url
  }
  if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
    const requestObj = {
      url: config.url,
      data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
      time: new Date().getTime(),
    }
    const requestSize = Object.keys(JSON.stringify(requestObj)).length // 请求数据大小
    const limitSize = 5 * 1024 * 1024 // 限制存放数据5M
    if (requestSize >= limitSize) {
      console.warn(`[${config.url}]: ` + '请求数据大小超出允许的5M限制，无法进行防重复提交验证。')
      return config
    }

    const cookieObj = cookies.cookies.getJSON('cookieObj')
    if (cookieObj === undefined || cookieObj === null || cookieObj === '') {
      cookies.cookies.setJSON('cookieObj', requestObj)
    } else {
      const s_url = cookieObj.url // 请求地址
      const s_data = cookieObj.data // 请求数据
      const s_time = cookieObj.time // 请求时间
      const interval = 100000 // 间隔时间(ms)，小于此时间视为重复提交
      if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
        const message = '数据正在处理，请勿重复提交'
        console.warn(`[${s_url}]: ${message}`)
        return Promise.reject(message)
      } else {
        cookies.cookies.setJSON('cookieObj', requestObj)
      }
    }
  }
  return config
}, (error) => {
  Promise.reject(error).then((r) => {
  })
})

// 响应拦截器
instance.interceptors.response.use((res) => {
    // 未设置状态码则默认成功状态
    const code: any = res.data.code || 200
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode.default
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer')
      return res.data
    if (code === 401) {
      Promise.reject(new Error('无效的会话，或者会话已过期，请重新登录。')).then(r => {
      })
      return useResponseError(401,new Error("Unauthorized Exception"), "Unauthorized Exception")
    } else if (code === 500) {
      Promise.reject(new Error(msg)).then(res=>{})
      return useResponseError(code,new Error('error'), msg)
    } else if (code === 601) {
      Promise.reject(new Error('error')).then(res=>{})
      return useResponseError(code,new Error('error'), msg)
    } else if (code !== 200) {
      Promise.reject(new Error('error')).then(res=>{})
      return useResponseError(code,new Error('error'), msg)
    } else {
      return res.data
    }
  },
  (error) => {
    if (error.message) {
      if (error.message === 'Network Error')
        error.message = '后端接口连接异常'
      else if (error.message.includes('timeout'))
        error.message = '系统接口请求超时'
      else if (error.message.includes('Request failed with status code'))
        error.message = `系统接口${error.message.substring(error.message.length - 3)}异常`
    }
    Promise.reject(error).then(res=>{})
    return useResponseError(-1,error, error.message)
  },
)

export default instance
