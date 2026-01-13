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
  /**
   * @zh_CN 上级菜单id
   */
  parentId: number,

}

//  默认值
const props = withDefaults(defineProps<Props>(), {
  opened: false,
  menuList: [],
  parentId: 0
})
// 传递事件
const emit = defineEmits<{
  'update:opened': [value: boolean],
  'update:addMenu': [value: any],
}>()
// 表单实例
const useForm = Form.useForm;
// 模态框
const [modal, contextHolder] = Modal.useModal();
// 标题宽度
const labelCol = {span: 4};
// 组件宽度
const wrapperCol = {span: 20};
// 自定义字段
const fieldNames = {
  children: 'children',
  label: 'menuName',
  value: 'menuId',
};
// 表单字段
const modelRef = reactive({
  menuName: '',
  menuType: 'M',
  parentId: 0,
  orderNum: '',
  status: 0,
  component: '',
  visible: '0',
  path: '',
  routeName: '',
  perms: '',
  query: '',
  isCache: 1,
  isFrame: 1,
});
// 校验规则
const rulesRef = reactive({
  menuName: [
    {
      required: true,
      message: '请输入菜单名称',
    },
  ],
  orderNum: [
    {
      message: '请输入菜单顺序',
      required: true,
    },
  ],
  path: [{required: true, message: '请输入路由地址'}]

});
// 菜单树形数据
const menuTree = ref([]);

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
    Object.assign(modelRef, {
      ...toRaw(modelRef),
      parentId: props.parentId,
    })
  },
  onCancel() {
    emit('update:opened', false)
    resetFields()
  },
  onConfirm() {
    modal.confirm({
      title: '提示',
      icon: h(ExclamationCircleOutlined),
      content: '是否保存菜单数据',
      onOk() {
        validate()
          .then(() => {
            emit('update:addMenu', toRaw(modelRef))
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


watch(
  () => props.opened,
  (v) => (
    v ? scaleModalApi.open() : scaleModalApi.close()
  ),
  {immediate: true}
)
watch(() => props.menuList,
  (v) => (
    menuTree.value = v
  ))

watch(() => modelRef.menuType,
  (v) => (
    rulesRef.path[0].required = v !== 'F'
  ))
</script>

<template>
  <div class="space-y-4">
    <ScaleModal title="新增菜单" class="w-[550px] bg-background-deep">
      <AForm class="w-full" :label-col="labelCol" :wrapper-col="wrapperCol">
        <AFormItem label="上级菜单">
          <ATreeSelect
            v-model:value="modelRef.parentId"
            show-search
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="请选择上级菜单"
            allow-clear
            :tree-data="menuTree"
            :field-names="fieldNames"
            tree-node-filter-prop="menuName"
          >
          </ATreeSelect>
        </AFormItem>
        <AFormItem label="菜单类型">
          <ARadioGroup v-model:value="modelRef.menuType" name="radioGroup">
            <ARadio value="M">目录</ARadio>
            <ARadio value="C">菜单</ARadio>
            <ARadio value="F">按钮</ARadio>
          </ARadioGroup>
        </AFormItem>
        <AFormItem label="菜单名称" v-bind="validateInfos.menuName">
          <AInput v-model:value="modelRef.menuName" placeholder="请输入菜单名称"/>
        </AFormItem>
        <AFormItem label="显示顺序" v-bind="validateInfos.orderNum">
          <AInputNumber v-model:value="modelRef.orderNum" placeholder="请输入显示顺序"
                        class="w-full"/>
        </AFormItem>
        <AFormItem label="路由名称" v-if="modelRef.menuType==='C'">
          <AInput v-model:value="modelRef.routeName" placeholder="请输入路由名称"/>
        </AFormItem>
        <AFormItem label="是否外链" v-if="modelRef.menuType !=='F'">
          <ARadioGroup v-model:value="modelRef.isFrame" name="radioGroup">
            <ARadio :value="0">是</ARadio>
            <ARadio :value="1">否</ARadio>
          </ARadioGroup>
        </AFormItem>
        <AFormItem label="路由地址" v-if="modelRef.menuType !=='F'"
                   v-bind="validateInfos.path">
          <AInput v-model:value="modelRef.path"
                  placeholder="请输入路由地址"/>
        </AFormItem>
        <AFormItem label="组件路径" v-if="modelRef.menuType ==='C'">
          <AInput v-model:value="modelRef.component"
                  placeholder="请输入组件路径"/>
        </AFormItem>
        <AFormItem label="权限字符" v-if="modelRef.menuType !=='M'">
          <AInput v-model:value="modelRef.perms"
                  placeholder="请输入权限字符"/>
        </AFormItem>
        <AFormItem label="路由参数" v-if="modelRef.menuType ==='C'">
          <AInput v-model:value="modelRef.query"
                  placeholder="请输入路由参数"/>
        </AFormItem>
        <AFormItem label="是否缓存" v-if="modelRef.menuType ==='C'">
          <ARadioGroup v-model:value="modelRef.isCache" name="radioGroup">
            <ARadio :value="0">缓存</ARadio>
            <ARadio :value="1">不缓存</ARadio>
          </ARadioGroup>
        </AFormItem>
        <AFormItem label="显示状态" v-if="modelRef.menuType !=='F'">
          <ARadioGroup v-model:value="modelRef.visible" name="radioGroup">
            <ARadio value="0">显示</ARadio>
            <ARadio value="1">隐藏</ARadio>
          </ARadioGroup>
        </AFormItem>
        <AFormItem label="菜单状态">
          <ARadioGroup v-model:value="modelRef.status" name="radioGroup">
            <ARadio :value="0">正常</ARadio>
            <ARadio :value="1">停用</ARadio>
          </ARadioGroup>
        </AFormItem>
      </AForm>
    </ScaleModal>
    <!-- 读取 context 的 contextHolder   -->
    <contextHolder/>
  </div>
</template>

<style scoped>

</style>
