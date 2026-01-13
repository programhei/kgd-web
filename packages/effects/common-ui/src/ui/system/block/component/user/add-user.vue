<script setup lang="ts">
import {useVbenModal} from '@vben/common-ui'
import {watch, ref, reactive, toRaw, h} from "vue";
import {
  Form, Modal, message
} from 'ant-design-vue';
import {ExclamationCircleOutlined} from "@ant-design/icons-vue";

interface Props {
  /**
   * @zh_CN 模态框状态
   */
  opened: boolean,
  /**
   * @zh_CN 用户角色下拉列表
   */
  roleList: any
}

//  默认值
const props = withDefaults(defineProps<Props>(), {
  opened: false,
  roleList: []
})
// 传递事件
const emit = defineEmits<{
  'update:opened': [value: boolean],
  'update:addUser': [value: any],
}>()
// 角色列表
const roles = ref([])
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
  nickName: '',
  phonenumber: '',
  email: '',
  userName: '',
  password: '',
  sex: '',
  status: '',
  roleIds: [],
  remark: '',
});
// 校验规则
const rulesRef = reactive({
  nickName: [
    {
      required: true,
      message: '请输入用户昵称',
    },
  ],
  phonenumber: [
    {
      message: '请输入正确的联系方式',
      pattern: /^1[3-9]\d{9}$/,
      trigger: 'blur'
    },
  ],
  email: [
    {
      type: 'email',
      message: '请输入正确的邮箱',
      trigger: 'blur'
    },
  ],
  userName: [
    {
      required: true,
      message: '请输入用户名',
    },
  ],
  password: [
    {
      required: true,
      message: '请输入登录密码',
    },
  ],
});

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
  contentClass: 'flex  flex-col-center gap-10 justify-center p-5 ',
  onOpened() {
    props.roleList.forEach(item => {
      roles.value.push({
        label: item.label,
        value: item.value
      })
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
      content: '是否保存用户数据',
      onOk() {
        validate()
          .then(() => {
            emit('update:addUser', toRaw(modelRef))
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

</script>

<template>
  <div class="space-y-4">
    <ScaleModal title="新增用户" class="w-[550px] bg-background-deep">
      <AForm class="w-full" :label-col="labelCol" :wrapper-col="wrapperCol">
        <AFormItem label="用户昵称" v-bind="validateInfos.nickName">
          <AInput v-model:value="modelRef.nickName" placeholder="请输入用户昵称"/>
        </AFormItem>
        <AFormItem label="联系方式" v-bind="validateInfos.phonenumber">
          <AInput v-model:value="modelRef.phonenumber" :maxlength="11"
                  placeholder="请输入联系方式"/>
        </AFormItem>
        <AFormItem label="邮箱" v-bind="validateInfos.email">
          <AInput v-model:value="modelRef.email" placeholder="请输入邮箱"/>
        </AFormItem>
        <AFormItem label="用户名" v-bind="validateInfos.userName">
          <AInput v-model:value="modelRef.userName" placeholder="请输入用户名"/>
        </AFormItem>
        <AFormItem label="登录密码" v-bind="validateInfos.password">
          <AInput v-model:value="modelRef.password" placeholder="请输入登录密码"/>
        </AFormItem>
        <AFormItem label="性别">
          <ASelect v-model:value="modelRef.sex" placeholder="请选择性别">
            <ASelectOption :value="0">男</ASelectOption>
            <ASelectOption :value="1">女</ASelectOption>
            <ASelectOption :value="2">未知</ASelectOption>
          </ASelect>
        </AFormItem>
        <AFormItem label="用户状态">
          <ARadioGroup v-model:value="modelRef.status" name="radioGroup">
            <ARadio :value="0">正常</ARadio>
            <ARadio :value="1">停用</ARadio>
          </ARadioGroup>
        </AFormItem>
        <AFormItem label="用户角色">
          <ASelect mode="multiple" v-model:value="modelRef.roleIds" placeholder="请选择用户角色">
            <ASelectOption v-for="role in roles" :value="role.value">{{ role.label }}
            </ASelectOption>
          </ASelect>
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
