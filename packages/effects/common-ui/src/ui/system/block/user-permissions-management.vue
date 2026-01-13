<script setup lang="ts">
import {computed, reactive, ref, toRaw, h} from 'vue'
import {
  Card,
  CardContent,
  CardHeader,
} from '@vben-core/shadcn-ui';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  RetweetOutlined,
  PlusOutlined, ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import {Form, message, Modal} from 'ant-design-vue';
import {
  AddUserModal,
  UpdateUserModal,
  AddRoleModal,
  UpdateRoleModal,
  AddMenuModal,
  UpdateMenuModal
} from './component/index'

// 表单实例
const useForm = Form.useForm;
// 模态框
const [modal, contextHolder] = Modal.useModal();

// 传值类型
interface Props {
  /**
   * @zh_CN 数据列表
   */
  datasource: any,
  /**
   * @zh_CN 记录总数
   */
  total: number,
  /**
   * @zh_CN 用户角色下拉列表
   */
  roleList: any
  /**
   * @zh_CN 用户数据
   */
  userInfo: any,
  /**
   * @zh_CN 菜单树形数据
   */
  menuList: any,
  /**
   * @zh_CN 角色数据
   */
  roleInfo: any,
  /**
   * @zh_CN 角色权限菜单树形数据
   */
  checkedKeys: any,
  /**
   * @zh_CN 菜单数据
   */
  menuInfo: any,
}

//  默认值
const props = withDefaults(defineProps<Props>(), {
  datasource: [],
  total: 0,
  roleList: [],
  userInfo: {},
  menuList: [],
  checkedKeys: [],
  roleInfo: {},
  menuInfo: {},
})
// 定义事件
const emit = defineEmits<{
  'update:radioValue': [value: string],
  'update:query': [value: any],
  'update:addUser': [value: any],
  'update:updateUser': [value: any],
  'update:deleteUser': [value: any],
  'update:getUser': [value: any],
  'update:addRole': [value: any],
  'update:updateRole': [value: any],
  'update:deleteRole': [value: any],
  'update:getRole': [value: any],
  'update:addMenu': [value: any],
  'update:updateMenu': [value: any],
  'update:deleteMenu': [value: any],
  'update:getMenu': [value: any],
  'update:getMenuList': [value: any],
}>()
// 单选值
const radioValue = ref('user')
// 新增用户弹框
const opened = ref(false)
// 编辑用户弹框
const updateOpened = ref(false)
// 新增角色弹框
const roleOpened = ref(false)
// 编辑角色弹框
const updateRoleOpened = ref(false)
// 新增菜单弹框
const menuOpened = ref(false)
// 编辑菜单弹框
const updateMenuOpened = ref(false)
// 上级菜单的id
const parentId = ref(0)
// 单选监听事件
const handleRadioChange = (value) => {
  emit('update:radioValue', value.target.value)
}
// 数据绑定
const modelRef = reactive({
  userName: undefined,
  roleName: undefined,
  menuName: undefined,
});
// form表单
const {resetFields, validate, validateInfos} = useForm(modelRef);

// 定义用户表格列
const column = ref([
  {
    title: '昵称',
    dataIndex: 'nickName',
    key: 'nickName',
    align: 'center'
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    key: 'userName',
    align: 'center'
  },
  {
    title: '联系方式',
    dataIndex: 'phonenumber',
    key: 'phonenumber',
    align: 'center'
  },
  {
    title: '邮箱',
    key: 'email',
    dataIndex: 'email',
    align: 'center'
  },
  {
    title: '创建时间',
    key: 'createTime',
    align: 'center',
    dataIndex: 'createTime',
  }, {
    title: '创建人',
    key: 'createBy',
    dataIndex: 'createBy',
    align: 'center'
  },
  {
    title: '是否是管理员',
    dataIndex: 'isAdmin',
    key: 'isAdmin',
    align: 'center'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    align: 'center'
  },
])
// 定义角色表格列
const roleColumn = ref([
  {
    title: '角色名称',
    dataIndex: 'roleName',
    key: 'roleName',
    align: 'center'
  },
  {
    title: '权限字符',
    dataIndex: 'roleKey',
    key: 'roleKey',
    align: 'center'
  },
  {
    title: '显示顺序',
    dataIndex: 'roleSort',
    key: 'roleSort',
    align: 'center'
  },

  {
    title: '创建时间',
    key: 'createTime',
    align: 'center',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    width: 120
  },
])
// 定义菜单表格列
const menuColumn = ref([
  {
    title: '菜单名称',
    dataIndex: 'menuName',
    key: 'menuName',
    align: 'center'
  },
  {
    title: '图标',
    dataIndex: 'icon',
    key: 'icon',
    align: 'center'
  },
  {
    title: '排序',
    dataIndex: 'orderNum',
    key: 'orderNum',
    align: 'center'
  },
  {
    title: '组件路径',
    dataIndex: 'component',
    key: 'component',
    align: 'center'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center'
  },

  {
    title: '创建时间',
    key: 'createTime',
    align: 'center',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    width: 180
  },
])
// 新数据
const newDataSource = computed(() => {
  return props.datasource.map((item: any) => {
    return {
      ...item,
      key: item.userId ?? item.roleId,
      isAdmin: item.admin ? '是' : '否'
    }
  })
})
// 分页状态
const pageConfig = computed(() => {
  return {
    current: 1,        // 当前页
    pageSize: 10,      // 每页条数
    total: props.total,          // 总条数（后端返回）
    showSizeChanger: true,  // 是否显示 pageSize 下拉
    showQuickJumper: true,  // 快速跳页
    showTotal: (total: number) => `共 ${props.total} 条`,
  }
})
// 选择key
type Key = string | number;
const state = reactive<{
  selectedRowKeys: Key[];
  loading: boolean;
}>({
  selectedRowKeys: [],
  loading: false,
});
// 表格选择
const handleTableSelectChange = (selectedRowKeys: Key[]) => {
  state.selectedRowKeys = selectedRowKeys;
};
// 页码或每页条数变化
const handleTableChange = (pag: { current: number; pageSize: number }) => {
  // 分页
  pageConfig.value.current = pag.current
  // 记录数
  pageConfig.value.pageSize = pag.pageSize
  // 查询
  handleDataSourceQuery()
}
// 新增用户
const handleAddUser = (data) => {
  emit('update:addUser', data)
}
// 修改用户
const handleUpdateUser = (data) => {
  emit('update:updateUser', data)
}
// 删除用户
const handleDelUser = (userId) => {
  if (!userId && state.selectedRowKeys.length === 0) {
    return message.warn("至少选一条记录进行删除")
  }
  modal.confirm({
    title: '提示',
    icon: h(ExclamationCircleOutlined),
    content: '是否删除当前所选用户数据',
    onOk() {
      emit('update:deleteUser', userId ? [userId] : state.selectedRowKeys.map(item => {
        return item
      }))
    },
    onCancel() {
      message.info('用户取消操作')
    },
    class: 'test',
  });
}
// 新增角色
const handleAddRole = (data) => {
  emit('update:addRole', data)
}
// 编辑角色
const handleUpdateRole = (data) => {
  emit('update:updateRole', data)
}
// 删除角色
const handleDelRole = (roleId) => {
  if (!roleId && state.selectedRowKeys.length === 0) {
    return message.warn("至少选一条记录进行删除")
  }
  modal.confirm({
    title: '提示',
    icon: h(ExclamationCircleOutlined),
    content: '是否删除当前所选角色数据',
    onOk() {
      emit('update:deleteRole', roleId ? [roleId] : state.selectedRowKeys.map(item => {
        return item
      }))
    },
    onCancel() {
      message.info('用户取消操作')
    },
    class: 'test',
  });
}
// 新增菜单
const handleAddMenu = (data) => {
  emit('update:addMenu', data)
}
// 编辑菜单
const handleUpdateMenu = (data) => {
  emit('update:updateMenu', data)
}
// 删除菜单
const handleDelMenu = (menuId) => {
  if (!menuId && state.selectedRowKeys.length === 0) {
    return message.warn("至少选一条记录进行删除")
  }
  modal.confirm({
    title: '提示',
    icon: h(ExclamationCircleOutlined),
    content: '是否删除当前所选菜单数据',
    onOk() {
      emit('update:deleteMenu', menuId ? [menuId] : state.selectedRowKeys.map(item => {
        return item
      }))
    },
    onCancel() {
      message.info('用户取消操作')
    },
    class: 'test',
  });
}
// 新增用户/角色/菜单弹框
const handleOpenAddModal = () => {
  if (radioValue.value === 'user') {
    opened.value = true
  }
  if (radioValue.value === 'role') {
    roleOpened.value = true
    emit('update:getMenuList', {
      extra: 'role-add'
    })
  }
  if (radioValue.value === 'menu') {
    menuOpened.value = true
    emit('update:getMenuList', {
      extra: 'menu-add'
    })
  }
}
// 编辑行记录
const handleRowEdit = (id) => {
  if (radioValue.value === 'user') {
    emit('update:getUser', id)
    updateOpened.value = true
  }
  if (radioValue.value === 'role') {
    emit('update:getRole', id)
    emit('update:getMenuList', {
      extra: 'role-edit',
      id
    })
    updateRoleOpened.value = true
  }
  if (radioValue.value === 'menu') {
    emit('update:getMenu', id)
    emit('update:getMenuList', {
      extra: 'menu-edit'
    })
    updateMenuOpened.value = true
  }
}
// 删除行记录
const handleRowDelete = (id) => {
  if (radioValue.value === 'user') {
    handleDelUser(id)
  }
  if (radioValue.value === 'role') {
    handleDelRole(id)
  }
  if (radioValue.value === 'menu') {
    handleDelMenu(id)
  }
}
// 新增行记录
const handleRowAdd = (id) => {
  parentId.value = id
  emit('update:getMenuList', {
    extra: 'menu-add'
  })
  menuOpened.value = true
}
//查询
const handleDataSourceQuery = () => {
  if (radioValue.value === 'user') {
    emit('update:query', {
      userName: toRaw(modelRef).userName,
      radioValue: radioValue.value,
      pageNum: pageConfig.value.current,
      pageSize: pageConfig.value.pageSize
    })
  }
  if (radioValue.value === 'role') {
    emit('update:query', {
      roleName: toRaw(modelRef).roleName, radioValue: radioValue.value,
      pageNum: pageConfig.value.current,
      pageSize: pageConfig.value.pageSize
    })
  }
  if (radioValue.value === 'menu') {
    emit('update:query', {
      menuName: toRaw(modelRef).menuName, radioValue: radioValue.value,
      pageNum: pageConfig.value.current,
      pageSize: pageConfig.value.pageSize
    })
  }
}
// 重置
const handleRestQuery = () => {
  resetFields()
  if (radioValue.value === 'user') {
    emit('update:query', {userName: toRaw(modelRef).userName, radioValue: radioValue.value})
  }
  if (radioValue.value === 'role') {
    emit('update:query', {roleName: toRaw(modelRef).roleName, radioValue: radioValue.value})
  }
  if (radioValue.value === 'menu') {
    emit('update:query', {menuName: toRaw(modelRef).menuName, radioValue: radioValue.value})
  }
}

</script>

<template>
  <Card class="w-full h-full border-0  rounded-none bg-transparent">
    <CardHeader>
      <a-radio-group v-model:value="radioValue" button-style="solid" @change="handleRadioChange">
        <a-radio-button value="user">用户管理</a-radio-button>
        <a-radio-button value="role">角色管理</a-radio-button>
        <a-radio-button value="menu">菜单管理</a-radio-button>
      </a-radio-group>
    </CardHeader>
    <CardContent>
      <div class="flex flex-col gap-5" v-if="radioValue==='user'">
        <div class="flex justify-end">
          <a-form layout="inline">
            <a-form-item label="用户名">
              <a-input v-model:value="modelRef.userName" placeholder="请输入用户名"/>
            </a-form-item>
            <a-form-item label="角色名称" v-if="radioValue==='role'">
              <a-input v-model:value="modelRef.roleName" placeholder="请输入角色名称"/>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleDataSourceQuery">
                <SearchOutlined/>
                查询
              </a-button>
            </a-form-item>
            <a-form-item>
              <a-button type="default" @click="handleRestQuery">
                <RetweetOutlined/>
                重置
              </a-button>
            </a-form-item>
            <a-form-item>
              <a-button ghost type="primary" @click="handleOpenAddModal">
                <PlusOutlined/>
                新增
              </a-button>
            </a-form-item>
            <a-form-item>
              <a-button danger @click="handleDelUser()">
                <DeleteOutlined/>
                删除
              </a-button>
            </a-form-item>
          </a-form>
        </div>
        <a-table
          :columns="column"
          :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: handleTableSelectChange }"
          :data-source="newDataSource"
          bordered
          :pagination="pageConfig"
          @change="handleTableChange"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <ATag v-if="record.status ==='0'" color="#108ee9">正常</ATag>
              <ATag v-if="record.status === '1'" color="#f50">禁用</ATag>
            </template>
            <template v-if="column.key === 'action'">
              <ASpace>
                <AButton type="link" size="small" @click="handleRowEdit(record.userId)">
                  <EditOutlined/>
                </AButton>
                <AButton type="link" danger size="small" @click="handleRowDelete(record.userId)">
                  <DeleteOutlined/>
                </AButton>
              </ASpace>
            </template>

          </template>
        </a-table>
      </div>
      <div class="flex flex-col gap-5" v-if="radioValue==='role'">
        <div class="flex justify-end">
          <a-form layout="inline">
            <a-form-item label="角色名称">
              <a-input v-model:value="modelRef.roleName" placeholder="请输入角色名称"/>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleDataSourceQuery">
                <SearchOutlined/>
                查询
              </a-button>
            </a-form-item>
            <a-form-item>
              <a-button type="default" @click="handleRestQuery">
                <RetweetOutlined/>
                重置
              </a-button>
            </a-form-item>
            <a-form-item>
              <a-button ghost type="primary" @click="handleOpenAddModal">
                <PlusOutlined/>
                新增
              </a-button>
            </a-form-item>
            <a-form-item>
              <a-button danger @click="handleDelRole">
                <DeleteOutlined/>
                删除
              </a-button>
            </a-form-item>
          </a-form>
        </div>
        <a-table
          :columns="roleColumn"
          :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: handleTableSelectChange }"
          :data-source="datasource"
          bordered
          size="small"
          :pagination="pageConfig"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action' && record.roleKey !=='admin'">
              <a-space>
                <a-button type="link" size="small" @click="handleRowEdit(record.roleId)">
                  <EditOutlined/>
                </a-button>
                <a-button type="link" danger size="small" @click="handleRowDelete(record.roleId)">
                  <DeleteOutlined/>
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
      <div class="flex flex-col gap-5" v-if="radioValue==='menu'">
        <div class="flex justify-end">
          <a-form layout="inline">
            <a-form-item label="菜单名称">
              <a-input v-model:value="modelRef.roleName" placeholder="请输入菜单名称"/>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleDataSourceQuery">
                <SearchOutlined/>
                查询
              </a-button>
            </a-form-item>
            <a-form-item>
              <a-button type="default" @click="handleRestQuery">
                <RetweetOutlined/>
                重置
              </a-button>
            </a-form-item>
            <a-form-item>
              <a-button ghost type="primary" @click="handleOpenAddModal">
                <PlusOutlined/>
                新增
              </a-button>
            </a-form-item>
          </a-form>
        </div>
        <a-table
          :columns="menuColumn"
          :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: handleTableSelectChange }"
          :data-source="datasource"
          bordered
          size="small"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <ATag v-if="record.status ==='0'" color="#108ee9">正常</ATag>
              <ATag v-if="record.status === '1'" color="#f50">禁用</ATag>
            </template>
            <template v-if="column.key === 'action' && record.roleKey !=='admin'">
              <a-space>
                <a-button type="link" size="small" @click="handleRowAdd(record.menuId)">
                  <PlusOutlined/>
                </a-button>
                <a-button type="link" size="small" @click="handleRowEdit(record.menuId)">
                  <EditOutlined/>
                </a-button>
                <a-button type="link" danger size="small" @click="handleRowDelete(record.menuId)">
                  <DeleteOutlined/>
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </CardContent>
    <!-- 新增用户   -->
    <AddUserModal v-if="opened" v-model:opened="opened" :role-list="roleList"
                  @update:addUser="handleAddUser"
    />
    <!--  编辑用户   -->
    <UpdateUserModal v-if="updateOpened" v-model:update-opened="updateOpened"
                     :role-list="roleList" @update:updateUser="handleUpdateUser"
                     :user-info="userInfo"/>
    <!-- 新增角色   -->
    <AddRoleModal v-if="roleOpened" v-model:opened="roleOpened"
                  @update:addRole="handleAddRole" :menu-list="menuList"
    />
    <!-- 编辑角色   -->
    <UpdateRoleModal v-if="updateRoleOpened" v-model:opened="updateRoleOpened"
                     @update:updateRole="handleUpdateRole" :menu-list="menuList"
                     :role-info="roleInfo" :checked-keys="checkedKeys"
    />
    <!-- 新增菜单   -->
    <AddMenuModal v-if="menuOpened" v-model:opened="menuOpened"
                  :parent-id="parentId"
                  @update:addMenu="handleAddMenu" :menu-list="menuList"
    />
    <!-- 编辑菜单   -->
    <UpdateMenuModal v-if="updateMenuOpened" v-model:opened="updateMenuOpened"
                     @update:updateMenu="handleUpdateMenu" :menu-list="menuList"
                     :menu-info="menuInfo"
    />
    <contextHolder/>
  </Card>
</template>

<style scoped>

</style>
