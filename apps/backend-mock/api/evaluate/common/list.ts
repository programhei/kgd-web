import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";
import {unAuthorizedResponse} from "~/utils/response";

// 查询体系数据列表
function listSystemFunctions(event: H3Event<EventHandlerRequest>, isStandard: any) {
  return request({
    url: '/evaluate/common/listSystemFunctions',
    method: 'get',
    params: {isStandard},
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 查询性能参数列表
function listFlightPerformanceAccuracy(event: H3Event<EventHandlerRequest>, isStandard: any) {
  return request({
    url: '/evaluate/common/listFlightPerformanceAccuracy',
    method: 'get',
    params: {isStandard},
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 查询性能参数列表
function listMissilePerformanceAccuracy(event: H3Event<EventHandlerRequest>, isStandard: any) {
  return request({
    url: '/evaluate/common/listMissilePerformanceAccuracy',
    method: 'get',
    params: {isStandard},
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}// 查询性能参数列表
function listRadarPerformanceAccuracy(event: H3Event<EventHandlerRequest>, isStandard: any) {
  return request({
    url: '/evaluate/common/listRadarPerformanceAccuracy',
    method: 'get',
    params: {isStandard},
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

//查询想定配置列表
function listReasonableAssumption(event: H3Event<EventHandlerRequest>, isStandard: any) {
  return request({
    url: '/evaluate/common/listReasonableAssumption',
    method: 'get',
    params: {isStandard},
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

//查询软件质量列表
function listSoftwareQuality(event: H3Event<EventHandlerRequest>) {
  return request({
    url: '/evaluate/common/listSoftwareQuality',
    method: 'get',
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

//查询支持智能决策模型生成与评估列表
function listIntelligentDecision(event: H3Event<EventHandlerRequest>) {
  return request({
    url: '/evaluate/common/listIntelligentDecision',
    method: 'get',
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

//查询评估分数列表
function listEvaluateScore(event: H3Event<EventHandlerRequest>) {
  return request({
    url: '/evaluate/common/listEvaluateScore',
    method: 'get',
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 接口映射
const listStrategies: Record<string, (event: any) => Promise<any>> = {
  TX: listSystemFunctions,
  FlightXN: listFlightPerformanceAccuracy,
  RadarXN: listRadarPerformanceAccuracy,
  MissileXN: listMissilePerformanceAccuracy,
  XD: listReasonableAssumption,
  RJ: listSoftwareQuality,
  ZN: listIntelligentDecision,
  ZT: listEvaluateScore
}
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const {extra, isStandard} = query

  if (!extra) {
    return useResponseError(-1, '参数丢失', new Error('extra && isStandard 必填'))
  }

  const handler = listStrategies[extra]
  if (!handler) {
    return useResponseError(-1, '不支持的类型', new Error(`不支持的 extra 类型：${extra}`))
  }
  try {
    const res = (extra === 'TX' || extra.indexOf("XN") !== -1 || extra === 'XD') ? await handler(event, isStandard) : await handler(event)
    if (res.code === 401) return unAuthorizedResponse(event)
    if (res.code === -1) return useResponseError(res.code, res.error, res.message)
    return useResponseSuccess(res)
  } catch (err) {
    return useResponseError(-1, 'SYSTEM_ERROR', (err as Error).message)
  }
})
