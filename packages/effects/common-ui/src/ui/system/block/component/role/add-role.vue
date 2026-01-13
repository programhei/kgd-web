<script setup lang="ts">
import {useVbenModal} from '@vben/common-ui'
import {watch, ref, reactive, toRaw, h, watchEffect} from "vue";
import {
  Form, Modal, message, type TreeProps
} from 'ant-design-vue';
import {ExclamationCircleOutlined} from "@ant-design/icons-vue";

interface Props {
  /**
   * @zh_CN 模态框状态
   */
  opened: boolean,
  /**
   * @zh_CN 菜单列表
   */
  menuList: any,
}

//  默认值
const props = withDefaults(defineProps<Props>(), {
  opened: false,
  menuList: []
})
// 传递事件
const emit = defineEmits<{
  'update:opened': [value: boolean],
  'update:addRole': [value: any],
}>()
// 表单实例
const useForm = Form.useForm;
// 模态框
const [modal, contextHolder] = Modal.useModal();
// 标题宽度
const labelCol = {span: 4};
// 组件宽度
const wrapperCol = {span: 20};
// 表单字段
const modelRef = reactive({
  roleName: '',
  roleKey: '',
  roleSort: '',
  status: '',
  roleIds: [],
  remark: '',
});
// 校验规则
const rulesRef = reactive({
  roleName: [
    {
      required: true,
      message: '请输入角色名称',
    },
  ],
  roleKey: [
    {
      message: '请输入权限字符',
      required: true,
    },
  ],
  roleSort: [
    {
      message: '请输入权限字符角色顺序',
      required: true,
    },
  ]
});
// 菜单树形数据
const menuTree = ref([]);
// 父子联动
const checkStrictly = ref(false)
// 全选/全不选的key集合
const checkedAllKeys = ref<number[]>([])
// 展开/折叠key集合
const expandedAllKeys = ref<number[]>([])
// 树形组件实例
const treeRef = ref<any>()
// 树形组件
const treeFieldNames: TreeProps['fieldNames'] = {
  title: 'label',
  key: 'id',
  children: 'children',
}
const addKeyDeep = (list: any[]): any[] =>
  list.map(n => ({...n, key: n.id, children: n.children ? addKeyDeep(n.children) : []}))

// 表单校验
const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef, {
  onValidate: (...args) => {
  },
});
// 使用modal的Api
const [ScaleModal, scaleModalApi] = useVbenModal({
  animationType: 'scale',
  draggable: true,
  fullscreen: false,
  fullscreenButton: false,
  showConfirmButton: true,
  contentClass: 'flex  flex-col-center gap-10 justify-start p-5',
  onOpened() {
    menuTree.value = addKeyDeep(props.menuList.filter(menu => menu.label !== '若依官网'))
  },
  onCancel() {
    emit('update:opened', false)
    resetFields()
  },
  onConfirm() {
    modal.confirm({
      title: '提示',
      icon: h(ExclamationCircleOutlined),
      content: '是否保存角色数据',
      onOk() {
        validate()
          .then(() => {
            emit('update:addRole', {
              ...toRaw(modelRef), menuIds: treeRef.value.checkedKeys.map(key => {
                return Number(key)
              })
            })
          })
          .catch(err => {
            console.log('error', err);
          })
          .finally(() => {
            emit('update:opened', false)
          });
      },
      onCancel() {
        message.info('用户取消操作')
      },
      class: 'test',
    });
  },
  onClosed() {
    emit('update:opened', false)
    resetFields()
  }
});
// 复选框组
const plainOptions = ['展开/折叠', '全选/全不选', '父子联动'];
// 绑定的值
const state = reactive({
  checkedList: ['父子联动'],
});

// 全选
const handleCheckAll = () => {
  checkedAllKeys.value = menuTree.value.map(menu => {
    return menu.key
  })
}

// 全不选
const handleUnCheckAll = () => {
  checkedAllKeys.value = []
}
// 展开
const handleExpandAll = () => {
  const keys: number[] = []
  const dfs = (nodes: any[]) => {
    nodes.forEach((node) => {
      keys.push(node.key)
      if (node.children) dfs(node.children)
    })
  }
  dfs(menuTree.value)
  expandedAllKeys.value = keys
}

// 折叠
const handleFoldAll = () => {
  expandedAllKeys.value = []
}
// 复选框的勾选事件
const handleCheckBoxChange = () => {
  // 复选框的勾选事件-父子联动
  checkStrictly.value = !state.checkedList.includes('父子联动')
  // 全选/全不选
  state.checkedList.includes('全选/全不选')
    ? handleCheckAll()
    : handleUnCheckAll()
  // 展开折叠
  state.checkedList.includes('展开/折叠') ? handleExpandAll() : handleFoldAll()
}
// 展开折叠
const handleExpand = (expandedKeys, e: { expanded: bool, node }) => {
  expandedAllKeys.value = expandedKeys
}
// 选择事件
const handleSelect = (selectedKeys, e: { selected: bool, selectedNodes, node, event }) => {
  expandedAllKeys.value.push(e.node.key)
}
// 选择框事件
const handleCheck = (checkedKeys, e: { checked: bool, checkedNodes, node, event }) => {
  checkedAllKeys.value = checkedKeys
}
watch(
  () => props.opened,
  (v) => (
    v ? scaleModalApi.open() : scaleModalApi.close()
  ),
  {immediate: true}
)
</script>

<template>
  <div class="space-y-4">
    <ScaleModal title="新增角色" class="w-[550px] bg-background-deep">
      <AForm class="w-full" :label-col="labelCol" :wrapper-col="wrapperCol">
        <AFormItem label="角色名称" v-bind="validateInfos.roleName">
          <AInput v-model:value="modelRef.roleName" placeholder="请输入角色名称"/>
        </AFormItem>
        <AFormItem label="权限字符" v-bind="validateInfos.roleKey">
          <AInput v-model:value="modelRef.roleKey"
                  placeholder="请输入权限字符"/>
        </AFormItem>
        <AFormItem label="角色排序" v-bind="validateInfos.roleSort">
          <AInputNumber v-model:value="modelRef.roleSort" placeholder="请输入角色序号" :min="0"
                        class="w-full"/>
        </AFormItem>
        <AFormItem label="角色状态">
          <ARadioGroup v-model:value="modelRef.status" name="radioGroup">
            <ARadio :value="0">正常</ARadio>
            <ARadio :value="1">停用</ARadio>
          </ARadioGroup>
        </AFormItem>
        <AFormItem label="角色权限">
          <ACheckboxGroup v-model:value="state.checkedList" @change="handleCheckBoxChange"
                          :options="plainOptions"/>
        </AFormItem>
        <AFormItem class="mt-[-30px]" label=" " :colon="false">
          <ATree
            ref="treeRef"
            :check-strictly="checkStrictly"
            class="mt-2"
            checkable
            :tree-data="menuTree"
            :field-names={treeFieldNames}
            :checked-keys="checkedAllKeys"
            :expanded-keys="expandedAllKeys"
            @expand="handleExpand"
            @select="handleSelect"
            @check="handleCheck"
          >
            <template #title="{label}">
              <span>{{ label }}</span>
            </template>
          </ATree>
        </AFormItem>
        <AFormItem label="备注">
          <ATextarea allow-clear v-model:value="modelRef.remark" placeholder="请输入备注"/>
        </AFormItem>
      </AForm>
    </ScaleModal>
    <!-- 读取 context 的 contextHolder   -->
    <contextHolder/>
  </div>
</template>

<style scoped>

</style>
