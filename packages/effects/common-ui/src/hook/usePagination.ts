import {computed} from "vue";

import type {Ref} from 'vue'

export interface Pagination {
  experimentalId?: null,
  experimentalCount?: null,
  variable?: null,
  variableValue?: null,
  score?: null,
  current?: number;
  pageSize?: number,
  extra?: string
}

export function usePagination(total: Ref<number>, onChange: (p: Pagination) => void) {
  const pagination = computed(() => ({
    total: total.value,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (t: number) => `共 ${t} 条`,
    pageSizeOptions: ['10', '20', '50', '100']
  }))

  function onTableChange({current: c, pageSize: ps}: any) {
    pagination.value.current = c
    pagination.value.pageSize = ps
    onChange({current: c, pageSize: ps})
  }

  return {pagination, onTableChange}
}
