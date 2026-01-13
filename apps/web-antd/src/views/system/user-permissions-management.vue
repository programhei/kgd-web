<script setup lang="ts">
import {UserPermissionsManagement} from '@vben/common-ui'
import {
  listUser, addUser, delUser, getUserInfo, updateUser,
  listRole, addRole, updateRole, delRole, getRoleInfo,
  treeList, roleTreeList, getRolesApi,
  listMenu, addMenu, updateMenu, delMenu, getMenuInfo
} from '#/api'
import {ref, onMounted} from 'vue'
import {message} from "ant-design-vue";

// 数据列表
const datasource = ref([])
//数据总数
const total = ref(0)
// roleList===select下拉选择
const roleList = ref([])
// 用户数据
const userInfo = ref({})
// 角色信息
const roleInfo = ref({})
// 菜单树形数据
const menuList = ref([])
// 选中的key集合
const checkedKeys = ref([])
// 菜单信息
const menuInfo = ref({})
// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  userName: undefined,
  roleName: undefined,
  menuName: undefined
})
// 初始用户列表
const handleInitUserDatasource = () => {
  listUser(queryParams.value).then(res => {
    datasource.value = res.rows
    total.value = res.total
  })
}
// 初始化角色列表
const handleInitRoleDatasource = () => {
  listRole(queryParams.value).then(res => {
    datasource.value = res.rows
    total.value = res.total
  })
}
// 初始化菜单列表
const handleInitMenuDatasource = () => {
  listMenu(queryParams.value).then(res => {
    datasource.value = res.menuTree
    total.value = res.total
  })
}
//初始化角色的select下拉选项
const handleInitRoleList = () => {
  getRolesApi().then(res => {
    res.forEach(data => {
      roleList.value.push({
        label: data.roleName,
        value: data.roleId,
        userList: data.userList
      })
    })
  })
}
// 查询
const handleQuery = (value) => {
  // 分页状态
  queryParams.value.pageSize = value.pageSize
  queryParams.value.pageNum = value.pageNum
  if (value.radioValue === 'user') {
    queryParams.value.userName = value.userName ?? undefined
    handleInitUserDatasource()
  }
  if (value.radioValue === 'role') {
    queryParams.value.roleName = value.roleName ?? undefined
    handleInitRoleDatasource()
  }
  if (value.radioValue === 'menu') {
    queryParams.value.menuName = value.menuName ?? undefined
    handleInitMenuDatasource()
  }
}
// 单选值更改
const handleRadioChange = (value) => {
  // 用户
  if (value === 'user') {
    handleInitUserDatasource()
  }
  // 角色
  if (value === 'role') {
    handleInitRoleDatasource()
  }
  // 菜单
  if (value === 'menu') {
    handleInitMenuDatasource()
  }
}

// 新增用户
const handleAddUser = (data) => {
  addUser(data).then(res => {
    handleInitUserDatasource()
    res.code === 200 ? message.success(res.msg) : message.error(res.error ?? res.message)
  })
}
// 删除用户
const handleDeleteUser = (userIds: any) => {
  delUser({userId: userIds}).then(res => {
    handleInitUserDatasource()
    res.code === 200 ? message.success(res.msg) : message.error(res.error ?? res.message)
  })
}
// 删除用户
const handleUpdateUser = (data: any) => {
  updateUser(data).then(res => {
    handleInitUserDatasource()
    res.code === 200 ? message.success(res.msg) : message.error(res.error ?? res.message)
  })
}
// 获取用户数据
const handleGetUserInfo = (userId) => {
  getUserInfo({userId}).then(res => {
    userInfo.value = {
      ...res.data,
      roleIds: res.roleIds
    }
  })
}
// 新增角色
const handleAddRole = (data) => {
  addRole(data).then(res => {
    handleInitRoleDatasource()
    res.code === 200 ? message.success(res.msg) : message.error(res.error.message ?? res.error ?? res.message)
  })
}
// 编辑角色
const handleUpdateRole = (data) => {
  updateRole(data).then(res => {
    handleInitRoleDatasource()
    res.code === 200 ? message.success(res.msg) : message.error(res.error.message ?? res.error ?? res.message)
  })
}
// 删除角色
const handleDeleteRole = (roleId) => {
  delRole({roleId}).then(res => {
    handleInitRoleDatasource()
    res.code === 200 ? message.success(res.msg) : message.error(res.error.message ?? res.error ?? res.message)
  })
}
// 获取用户数据
const handleGetRoleInfo = (roleId) => {
  getRoleInfo({roleId}).then(res => {
    roleInfo.value = {
      ...res.data
    }
  })
}
// 树形菜单数据
const handleGetMenuList = (value) => {
  if (value.extra === 'role-add') {
    treeList().then(res => {
      menuList.value = res.data
    })
  }
  if (value.extra === 'menu-add' || value.extra === 'menu-edit') {
    listMenu().then(res => {
      const menu = {menuId: 0, menuName: '主类目', children: []}
      menu.children = res.menuTree
      menuList.value = [menu]
    })
  }
  if (value.extra === 'role-edit') {
    roleTreeList(value.id).then(res => {
      menuList.value = res.menus;
      checkedKeys.value = res.checkedKeys
    })
  }
}
// 新增菜单
const handleAddMenu = (data) => {
  addMenu(data).then(res => {
    handleInitMenuDatasource()
    res.code === 200 ? message.success(res.msg) : message.error(res.error.message ?? res.error ?? res.message)
  })
}
// 编辑菜单
const handleUpdateMenu = (data) => {
  updateMenu(data).then(res => {
    handleInitMenuDatasource()
    res.code === 200 ? message.success(res.msg) : message.error(res.error.message ?? res.error ?? res.message)
  })
}
// 删除菜单
const handleDeleteMenu = (menuId) => {
  delMenu({menuId}).then(res => {
    handleInitMenuDatasource()
    res.code === 200 ? message.success(res.msg) : message.error(res.error.message ?? res.error ?? res.message)
  })
}
// 获取用户数据
const handleGetMenuInfo = (menuId) => {
  getMenuInfo({menuId}).then(res => {
    menuInfo.value = {
      ...res.data
    }
  })
}
// 页面初始化赋值
onMounted(() => {
  // 默认初始化用户数据
  handleInitUserDatasource()
  // 初始化角色的select选项
  handleInitRoleList()
})


</script>

<template>
  <div>
    <UserPermissionsManagement @update:radioValue="handleRadioChange"
                               @update:query="handleQuery"
                               @update:addUser="handleAddUser"
                               @update:deleteUser="handleDeleteUser"
                               @update:getUser="handleGetUserInfo"
                               @update:updateUser="handleUpdateUser"
                               @update:addRole="handleAddRole"
                               @update:updateRole="handleUpdateRole"
                               @update:deleteRole="handleDeleteRole"
                               @update:getRole="handleGetRoleInfo"
                               @update:addMenu="handleAddMenu"
                               @update:updateMenu="handleUpdateMenu"
                               @update:deleteMenu="handleDeleteMenu"
                               @update:getMenu="handleGetMenuInfo"
                               @update:getMenuList="handleGetMenuList"
                               :user-info="userInfo"
                               :role-info="roleInfo"
                               :menu-info="menuInfo"
                               :datasource="datasource"
                               :role-list="roleList"
                               :menu-list="menuList"
                               :checked-keys="checkedKeys"
                               :total="total"/>

  </div>
</template>

<style scoped>

</style>
