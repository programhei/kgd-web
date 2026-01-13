import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";
import {unAuthorizedResponse} from "~/utils/response";
import {Axios, AxiosResponse} from "axios";

// 评估体系数据
function evaluateSystemFunctions(event: H3Event<EventHandlerRequest>, data: any) {
  return request({
    url: '/evaluate/common/evaluateSystemFunctions',
    method: 'post',
    data: data,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 评估性能参数
function evaluateFlightPerformanceAccuracy(event: H3Event<EventHandlerRequest>, data: any) {
  return request({
    url: '/evaluate/common/evaluateFlightPerformanceAccuracy',
    method: 'post',
    data: data,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 评估性能参数
function evaluateRadarPerformanceAccuracy(event: H3Event<EventHandlerRequest>, data: any) {
  return request({
    url: '/evaluate/common/evaluateRadarPerformanceAccuracy',
    method: 'post',
    data: data,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 评估性能参数
function evaluateMissilePerformanceAccuracy(event: H3Event<EventHandlerRequest>, data: any) {
  return request({
    url: '/evaluate/common/evaluateMissilePerformanceAccuracy',
    method: 'post',
    data: data,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 评估想定配置
function evaluateScenarioRationality(event: H3Event<EventHandlerRequest>, data: any) {
  return request({
    url: '/evaluate/common/evaluateScenarioRationality',
    method: 'post',
    data: data,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 评估软件质量
function evaluateSoftwareQuality(event: H3Event<EventHandlerRequest>, data: any) {
  return request({
    url: '/evaluate/common/evaluateSoftwareQuality',
    method: 'post',
    data: data,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 评估支持智能决策模型生成与评估
function evaluateIntelligentDecision(event: H3Event<EventHandlerRequest>, data: any) {
  return request({
    url: '/evaluate/common/evaluateIntelligentDecision',
    method: 'post',
    data: data,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 评估支持智能决策模型生成与评估-评估
function evaluateIntelligentDecisionEvaluate(event: H3Event<EventHandlerRequest>, data: any) {
  return request({
    url: '/evaluate/common/evaluateIntelligentDecisionEvaluate',
    method: 'post',
    data: data,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 总体评估
function overallEvaluation(event: H3Event<EventHandlerRequest>, data: any) {
  return request({
    url: '/evaluate/common/overallEvaluation',
    method: 'post',
    data: data,
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}


// 接口映射
const evaluateDataStrategies: Record<string, (event: any, data: any) => Promise<any>> = {
  TX: evaluateSystemFunctions,
  FlightXN: evaluateFlightPerformanceAccuracy,
  RadarXN: evaluateRadarPerformanceAccuracy,
  MissileXN: evaluateMissilePerformanceAccuracy,
  XD: evaluateScenarioRationality,
  RJ: evaluateSoftwareQuality,
  ZN: evaluateIntelligentDecision,
  ZT: overallEvaluation,
  EZN: evaluateIntelligentDecisionEvaluate
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ data: any, extra?: string }>(event)
  const {weightList, extra, interfaceList, compareList, xnList, variable,intelligentDecisions} = body


  if (!extra) {
    return useResponseError(-1, '参数丢失', new Error('extra 与 评估数据 必填'))
  }
  const handler = evaluateDataStrategies[extra]
  if (!handler) {
    return useResponseError(-1, '不支持的类型', new Error(`不支持的 extra 类型：${extra}`))
  }

  try {
    const res = await handler(event, body)
    if (res.code === 401) return unAuthorizedResponse(event)
    if (res.code === -1) return useResponseError(res.code, res.error, res.message)
    return useResponseSuccess(res.data)
  } catch (err) {
    return useResponseError(-1, '系统错误', (err as Error).message)
  }
})
