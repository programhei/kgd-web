<script setup lang="ts">
import {computed, reactive, ref, h, toRaw, watch, onMounted, onUnmounted} from 'vue'

import { UploadOutlined,SwapOutlined, InboxOutlined, DownloadOutlined } from '@ant-design/icons-vue';
import {
  Card,
  CardContent,
  CardHeader
} from "@vben-core/shadcn-ui";
import {message, Modal} from 'ant-design-vue';
import {useUpload} from "../../../hook/useUpload";
import {usePagination, type Pagination} from '../../../hook/usePagination'

const type = ref<string>('');
let groupId = ref("");
// 传值类型
interface Props {
  /**
   * @zh_CN 数据列表
   */
  datasource: any,
  /**
   * @zh_CN 数据总数
   */
  total: number,
  /**
   * @zh_CN 变量
   */
  treeData: any,
  /**
   * @zh_CN 权值组选项（根据角色显示不同的值）
   */
  weightGroup?: Array<{ label: string; value: string }>
  /**
   * @zh_CN 专家选项
   */
  expertOptions?: Array<{ label: string; value: string }>,
  /**
   * @zh_CN 是否为管理员
   */
  isAdmin?: boolean,
  /**
   * @zh_CN 表格加载态
   */
  loading?: boolean,
}

//  默认值
const props = defineProps<Props>();

// 处理后的权值组选项（添加全部选项）
const weightGroupWithAll = computed(() => {
  const allOption = [{ label: '全部', value: '' }];
  return allOption.concat(props.weightGroup || []);
});

// 处理后的专家选项（添加全部选项）
const expertOptionsWithAll = computed(() => {
  const allOption = [{ label: '全部', value: '' }];
  return allOption.concat(props.expertOptions || []);
});

// 设置默认权值组（取全部选项）
const setDefaultGroup = (list: Array<{ label: string; value: string }> = []) => {
  // 默认选择全部
  type.value = '';
};

// 权值组选项变化时，保持当前选择或重置为全部
watch(
  () => props.weightGroup,
  () => {
    // 保持当前选择或重置为全部
    if (!weightGroupWithAll.value.some(item => item.value === type.value)) {
      type.value = '';
    }
  },
  { immediate: true, deep: true },
);

// 专家选项变化时，确保当前选择有效
watch(
  () => props.expertOptions,
  () => {
    if (!expertOptionsWithAll.value.some(item => item.value === groupId.value)) {
      groupId.value = '';
    }
  },
  { immediate: true, deep: true },
);

// 传递事件
const emit = defineEmits<{
  'update:loadData': [value: any],
  'update:updateWeightTree': [value: any],
  'update:upload': [value: any],
  'update:fusionData': [value: any],
}>()
// 模态框
const [modal, contextHolder] = Modal.useModal();

// 单选框值
const radioValue = ref('sy')

// 窗口高度响应式
let windowHeight = ref(window.innerHeight);
let tableHeight = computed(() => windowHeight.value * 0.8);
// 处理窗口大小变化
function handleResize() {
  windowHeight.value = window.innerHeight;
}
const {fileList, uploading, beforeUpload, onRemove, onUploadChange, onSubmit} = useUpload(fd => {
  emit('update:upload', {formData: fd,type: type.value,groupId: groupId.value})
})

// 弹出层可见性
const visible = ref(false);

onMounted(() => {
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('resize', handleResize);
});


// 展开的节点key
let expandedKeys = ref([]);

// 表格数据
const tableData = computed(() => {
  if (!props.treeData || !Array.isArray(props.treeData)) {
    return [];
  }
  
  // 按照专家分组数据
  const expertMap = new Map();
  
  // 遍历所有数据，按groupId分组
  props.treeData.forEach(item => {
    const groupId = String(item.groupId || 'default');
    if (!expertMap.has(groupId)) {
      // 创建专家节点
      expertMap.set(groupId, {
        id: `expert_${groupId}`,
        name: getExpertName(groupId),
        groupId: groupId,
        weight: null,
        level: 0,
        children: [],
      });
    }
    // 添加当前项到对应专家的子节点中
    expertMap.get(groupId).children.push(item);
  });
  
  // 转换为数组返回
  return Array.from(expertMap.values());
})

// 展开数据绑定
function handleExpand  (expanded: boolean, record: any)  {
          const keys = [...expandedKeys.value];
          if (expanded) {
            if (!keys.includes(record.id as never)) {
              keys.push(record.id as never);
            }
          } else {
            const index = keys.indexOf(record.id as never);
            if (index > -1) {
              keys.splice(index, 1);
            }
          }
          expandedKeys.value = keys;
        };

// 查询权值数据
const handleLoadData = () => {
  // 当权值选择"全部"时，需要分别获取主观权值和客观权值数据
  if (!type.value) {
    // 主观权值类型
    const subjectiveType = '0';
    // 客观权值类型
    const objectiveType = '1';
    
    // 构建查询参数对象
    const subjectiveParams: any = {
      type: subjectiveType
    };
    
    const objectiveParams: any = {
      type: objectiveType
    };
    
    // 如果有专家筛选条件，添加到参数中
    if (groupId.value) {
      subjectiveParams.groupId = groupId.value;
      objectiveParams.groupId = groupId.value;
    }
    
    // 传递特殊标记，告知父组件需要获取全部权值数据
    emit('update:loadData', {
      isAll: true,
      subjectiveParams,
      objectiveParams
    });
  } else {
    // 选择特定权值类型时，正常传递参数
    const params: any = {
      type: type.value
    };
    
    // 仅当groupId有值时才添加groupId参数，否则不添加，以便加载所有专家数据
    if (groupId.value) {
      params.groupId = groupId.value;
    }
    
    emit('update:loadData', params);
  }
}
// 重置数据
const handleResetData = () => {
  setDefaultGroup(props.weightGroup || []);
  groupId.value = '';
  emit('update:loadData',
    {type: type.value,groupId: groupId.value}
  )
}
const handleTemplateDownload = () => {
  
  // 创建一个指向模板文件的链接
  // 假设模板文件位于 public 目录下，可以直接通过 URL 访问
  const templatePath = '/权值导入模版.zip'; // 或者具体的文件名如 '/权值导入模版.xlsx'
  
  // 创建一个隐藏的 a 标签用于触发下载
  const link = document.createElement('a');
  link.href = templatePath;
  link.download = '权值导入模版.zip'; // 设置下载文件名
  link.style.display = 'none';
  
  // 添加到页面并触发点击
  document.body.appendChild(link);
  link.click();
  
  // 清理 DOM
  document.body.removeChild(link);
};

// 融合数据
const handleFusionData = () => {
  emit('update:fusionData',{type: type.value,groupId: groupId.value})
}
// 获取专家名称
const getExpertName = (groupId: any) => {
  if (!groupId && groupId !== 0) return '-';
  const groupIdStr = String(groupId);
  const expert = props.expertOptions?.find(item => item.value === groupIdStr);
  return expert ? expert.label : `专家${groupIdStr}`;
};

// 表头
 const columns = ref([
          {
            title: '维度',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            fixed: 'left'
          },
          {
            title: '专家',
            dataIndex: 'groupId',
            key: 'groupId',
            width: 120
          },
          {
            title: '权值',
            dataIndex: 'weight',
            key: 'weight',
            width: 150
          },
          {
            title: '层级',
            dataIndex: 'level',
            key: 'level',
            width: 100
          }
        ]);

 // 保存权值数据
function handleWeightChange (newWeight: number, record: any)  {

   // 检查newWeight是否是数字
  if (newWeight === null || isNaN(Number(newWeight))) {
    return;
  }
  // 更新权值
  emit('update:updateWeightTree',
    {groupId: record.groupId , id: record.id, weight: newWeight}
  );
};

//设置等级颜色
function getLevelColor  (level: number)  {
  const colors = {
    0: 'black',
    1: 'blue',
    2: 'green',
    3: 'purple',
    4: 'orange',
    5: 'red'
  };
  return colors[level as keyof typeof colors] || 'gray';
};

</script>
<template>
  <Card class="w-full h-full border-0 rounded-none bg-transparent">
    <CardHeader> </CardHeader>
    <CardContent>
      <div v-if="radioValue === 'sy'" class="flex flex-col gap-5">
        <div class="flex justify-end">
          <a-form layout="inline">
            <a-form-item label="权值">
              <a-select
                style="width: 200px"
                :options="weightGroupWithAll"
                v-model:value="type"
                placeholder="请选权值组"
              >
              </a-select>
            </a-form-item>
            <a-form-item label="专家" >
              <a-select
                style="width: 200px"
                :options="expertOptionsWithAll"
                v-model:value="groupId"
                placeholder="请选择专家"
              >
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleLoadData">

                查询
              </a-button>
            </a-form-item>
            <a-form-item>
              <a-button @click="handleResetData">

                重置
              </a-button>
            </a-form-item>
            <a-form-item>
              <a-popover v-model:open="visible" trigger="click" placement="bottom">
                <template #content>
                  <a-upload-dragger
                    :file-list="fileList"
                    name="file"
                    @remove="onRemove"
                    @change="onUploadChange"
                    :before-upload="beforeUpload"
                  >
                    <p class="ant-upload-drag-icon">
                      <InboxOutlined/>
                    </p>
                    <p class="ant-upload-text">点击或拖拽文件到该区域进行文件上传</p>
                    <p class="ant-upload-hint">
                      支持单个或批量上传。严禁上传公司数据或其他受限制的文件。
                    </p>
                  </a-upload-dragger>
                  <a-button @click="onSubmit" class="mt-3 w-full"
                            :loading="uploading"
                            :disabled="fileList?.length === 0">
                    {{ uploading ? '上传中' : '开始上传' }}
                  </a-button>
                </template>
                <a-button type="primary" :icon="h(UploadOutlined)">导入数据</a-button>
              </a-popover>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" :icon="h(DownloadOutlined)" @click="handleTemplateDownload">
                下载模版
              </a-button>
            </a-form-item>
            <a-form-item v-if="props.isAdmin">
              <a-button type="primary" :icon="h(SwapOutlined )" @click="handleFusionData">
                融合数据
              </a-button>
            </a-form-item>
          </a-form>
        </div>
        <!-- 树形表格 -->
        <a-table
          :columns="columns"
          :data-source="tableData"
          :row-key="(record) => record.id"
          :childrenColumnName="'children'"
          :expandedRowKeys="expandedKeys"
          @expand="handleExpand"
          :pagination="false"
          bordered
          :scroll="{ x: 'max-content', y: tableHeight }"
          :sortable="false"
          :loading="props.loading"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'name'">
              <span :class="`level-${record.level}`">
                <span v-if="record.level === 0"></span>
                <span v-else-if="record.level === 1"></span>
                <span v-else-if="record.level === 2">├─ </span>
                <span v-else-if="record.level === 3">│ └─ </span>
                <span v-else-if="record.level === 4">│ └─ </span>
                {{ text }}
              </span>
            </template>
            <template v-else-if="column.dataIndex === 'groupId'">
              {{ getExpertName(record.groupId) }}
            </template>
            <template v-else-if="column.dataIndex === 'weight'">
              <a-input-number
                v-if="record.level > 0"
                :value="text"
                :min="0"
                :max="1"
                :step="0.01"
                :precision="4"
                size="small"
                @change="handleWeightChange($event, record)"
              />
              <span v-else>-</span>
            </template>
            <template v-else-if="column.dataIndex === 'level'">
              <a-tag :color="getLevelColor(record.level)"> 层级 {{ text }} </a-tag>
            </template>
          </template>
        </a-table>
      </div>
    </CardContent>
    <contextHolder />
  </Card>
</template>

<style scoped></style>
