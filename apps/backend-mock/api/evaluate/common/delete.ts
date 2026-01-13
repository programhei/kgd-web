import request from '../../../utils/request'
import {getRefreshTokenFromCookie} from "~/utils/cookie-utils";
import type {EventHandlerRequest, H3Event} from "h3";
import {unAuthorizedResponse} from "~/utils/response";

// 删除体系数据
function deleteSystemFunctions(event: H3Event<EventHandlerRequest>, dataId: string) {
  return request({
    url: '/evaluate/common/deleteSystemFunctions/' + dataId,
    method: 'delete',
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 删除性能参数
function deletePerformanceAccuracy(event: H3Event<EventHandlerRequest>, dataId: string) {
  return request({
    url: '/evaluate/common/deletePerformanceAccuracy/' + dataId,
    method: 'delete',
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 删除想定配置
function deleteReasonableAssumption(event: H3Event<EventHandlerRequest>, dataId: string) {
  return request({
    url: '/evaluate/common/deleteReasonableAssumption/' + dataId,
    method: 'delete',
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}

// 删除软件质量
function deleteSoftwareQuality(event: H3Event<EventHandlerRequest>, dataId: string) {
  return request({
    url: '/evaluate/common/deleteSoftwareQuality/' + dataId,
    method: 'delete',
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}
// 删除支持智能决策模型生成与评估
function deleteIntelligentDecision(event: H3Event<EventHandlerRequest>, dataId: string) {
  return request({
    url: '/evaluate/common/deleteIntelligentDecision/' + dataId,
    method: 'delete',
    headers: {
      Authorization: `Bearer ${getRefreshTokenFromCookie(event)}`
    }
  })
}


// 接口映射
const deleteStrategies: Record<string, (event: any, dataId: string) => Promise<any>> = {
  TX: deleteSystemFunctions,
  XN: deletePerformanceAccuracy,
  XD: deleteReasonableAssumption,
  RJ: deleteSoftwareQuality,
  ZN: deleteIntelligentDecision,
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ extra?: string; dataId?: string }>(event)
  const {extra, dataId} = body

  if (!extra || !dataId) {
    return useResponseError(-1, '参数丢失', new Error('extra 与 dataId 必填'))
  }

  const handler = deleteStrategies[extra]
  if (!handler) {
    return useResponseError(-1, '不支持的类型', new Error(`不支持的 extra 类型：${extra}`))
  }

  try {
    const res = await handler(event, dataId)
    if (res.code === 401) return unAuthorizedResponse(event)
    if (res.code === -1) return useResponseError(res.code, res.error, res.message)
    return useResponseSuccess(res)
  } catch (err) {
    return useResponseError(-1, 'SYSTEM_ERROR', (err as Error).message)
  }
})
