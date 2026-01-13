import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";
import {unAuthorizedResponse} from "~/utils/response";
import {Axios, AxiosResponse} from "axios";

// 导入体系数据
function importSystemFunctions(event: H3Event<EventHandlerRequest>, params: any) {
  return request({
    url: '/evaluate/common/importSystemFunctions',
    method: 'get',
    params: params,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 导入飞行性能参数
function importFlightPerformanceAccuracy(event: H3Event<EventHandlerRequest>, params: any) {
  return request({
    url: '/evaluate/common/importFlightPerformanceAccuracy',
    method: 'get',
    params: params,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 导入飞行性能参数
function importRadarPerformanceAccuracy(event: H3Event<EventHandlerRequest>, params: any) {
  return request({
    url: '/evaluate/common/importRadarPerformanceAccuracy',
    method: 'get',
    params: params,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}// 导入飞行性能参数
function importMissilePerformanceAccuracy(event: H3Event<EventHandlerRequest>, params: any) {
  return request({
    url: '/evaluate/common/importMissilePerformanceAccuracy',
    method: 'get',
    params: params,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 导入想定配置
function importReasonableAssumption(event: H3Event<EventHandlerRequest>, params: any) {
  return request({
    url: '/evaluate/common/importReasonableAssumption',
    method: 'get',
    params: params,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 导入软件质量
function importSoftwareQuality(event: H3Event<EventHandlerRequest>, params: any) {
  return request({
    url: '/evaluate/common/importSoftwareQuality',
    method: 'get',
    params: params,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 导入支持智能决策模型生成与评估
function importIntelligentDecision(event: H3Event<EventHandlerRequest>, params: any) {
  return request({
    url: '/evaluate/common/importIntelligentDecision',
    method: 'get',
    params: params,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 导入支持智能决策模型生成与评估-评估
function importIntelligentDecisionEvaluate(event: H3Event<EventHandlerRequest>, params: any) {
  return request({
    url: '/evaluate/common/importIntelligentDecisionEvaluate',
    method: 'get',
    params: params,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}


// 接口映射
const importDataStrategies: Record<string, (event: any, path: string) => Promise<any>> = {
  TX: importSystemFunctions,
  FlightXN: importFlightPerformanceAccuracy,
  RadarXN: importRadarPerformanceAccuracy,
  MissileXN: importMissilePerformanceAccuracy,
  XD: importReasonableAssumption,
  RJ: importSoftwareQuality,
  ZN: importIntelligentDecision,
  EZN: importIntelligentDecisionEvaluate,
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  console.log('import-data query=====', query)
  const {extra, filePath, isStandard, isPerformance} = query
  if (!extra || !filePath || !isStandard || !isPerformance) {
    return useResponseError(-1, '参数丢失', 'extra 与 filePath、isStandard、isPerformance 必填')
  }
  console.log('extra=====')
  console.log(extra)
  console.log('extra=======')
  const handler = importDataStrategies[extra]
  if (!handler) {
    return useResponseError(-1, '不支持的类型', `不支持的 extra 类型：${extra}`)
  }

  try {
    const res = await handler(event, query)
    if (res.code === 401) return unAuthorizedResponse(event)
    if (res.code === -1) return useResponseError(res.code, res.error, res.message)
    return useResponseSuccess(res)
  } catch (err) {
    return useResponseError(-1, '系统错误', (err as Error).message)
  }
})
