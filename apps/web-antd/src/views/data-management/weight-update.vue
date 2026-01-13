<script setup lang="ts">
import {ref, onMounted, computed, watch} from 'vue'
import {useRouter} from 'vue-router'
import {storeToRefs} from 'pinia'
import {WeightUpdate} from '@vben/common-ui'
import {
  selectWeightTree,
  updateWeightTreeValue,
    upload,
    importAfSimExperimentalRecord,
    selectUserIds
} from '#/api'
import {message} from "ant-design-vue";
import {useUserStore} from "@vben/stores";
import {useAuthStore} from '#/store';

// 获取用户信息
const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
// 使用 storeToRefs 确保响应式
const {userInfo: userInfoRef, userRoles: userRolesRef} = storeToRefs(userStore);

// 获取所有用户角色（支持多角色判断）- 使用 computed 确保响应式
const getAllRoles = computed((): string[] => {
  const roles: string[] = [];
  
  // 优先使用 userRoles（可能是字符串数组或对象数组）
  if (userRolesRef.value && userRolesRef.value.length > 0) {
    const firstItem = userRolesRef.value[0];
    
    // 如果是字符串数组，直接返回
    if (typeof firstItem === 'string') {
      return userRolesRef.value as string[];
    }
    
    // 如果是对象数组，提取 roleKey 或 roleName
    if (typeof firstItem === 'object' && firstItem !== null) {
      const extractedRoles = userRolesRef.value.map((role: any) => {
        return role.roleKey || role.roleName || role.value || role;
      }).filter(Boolean);
      return extractedRoles;
    }
  }
  
  // 如果 userRoles 为空，尝试从 userInfo.roles 获取
  if (userInfoRef.value?.roles) {
    const rolesData = userInfoRef.value.roles;
    if (Array.isArray(rolesData) && rolesData.length > 0) {
      // 如果是字符串数组
      if (typeof rolesData[0] === 'string') {
        return rolesData as string[];
      } 
      // 如果是对象数组，提取 roleKey 或 roleName
      else if (typeof rolesData[0] === 'object' && rolesData[0] !== null) {
        const extractedRoles = rolesData.map((role: any) => role.roleKey || role.roleName || role.value || role).filter(Boolean);
        return extractedRoles;
      }
    }
  }
  
  return roles;
});

// 判断是否是管理员角色
const isAdmin = computed(() => {
  const userRoles = getAllRoles.value;
  const isAdminResult = userRoles.some(role => {
    const roleStr = String(role).toLowerCase();
    return roleStr === 'admin' || 
           role === '超级管理员' ||
           roleStr === 'administrator' ||
           roleStr.includes('admin');
  });
  return isAdminResult;
});


// 根据角色显示不同的权值组选项
const weightGroup = computed(() => {
  // 获取所有角色
  const userRoles = getAllRoles.value;
  
  
  // 定义权值组选项
  const allGroups = [
    //  {label: '综合权值融合', value: '1'},
      {label: '主观权值', value: '0'},
      {label: '客观权值', value: '1'},
  ];
  
  // 默认返回所有选项（如果没有匹配的角色）
  return allGroups;
});


const expertOptions = ref([
])

// 数据列表
const datasource = ref([])
// 记录总数
const total = ref(0)
// 维度树形数据
const treeData = ref([])
// 表格加载
const loading = ref(false)

// 查询权值数据
const handleLoadData = (pager: any) => {
  loading.value = true
  selectWeightTree(pager)
    .then(res => {
    treeData.value = res.treeData.data.list
  })
    .finally(() => {
      loading.value = false
    })
}

// 初始化权值数据
const handleInitWeightData= () => {
  loading.value = true
  selectUserIds().then(res => {
    // 后端返回的 data 直接是数组（List<Long>），需要转换为 { label, value } 格式
    if (res && Array.isArray(res)) {

      expertOptions.value = res.map((id: number) => ({
        label: `专家${id}`,
        value: String(id)
      }))
      console.log(expertOptions.value)
    } else {
      expertOptions.value = []
    }
  })
  selectWeightTree({type:0
  }).then(res => {
    treeData.value = res.treeData.data.list
  }).finally(() => {
    loading.value = false
  })
}

// 文件上传
const handleSubmitUpload = (value: any) => {
  const {formData, paper} = value
  return upload(formData).then(res => {
    importAfSimExperimentalRecord({filePath: res.path}).then(() => {
      // handleLoadData(paper)
      message.success('数据上传成功')
    })
  })
}
// 更新权值数据
const handleUpdateWeightTree = (pager: any) => {
    updateWeightTreeValue(pager).then(res => {
  })
}

// 跳转融合数据
const handleFusionData = () => {
  router.push('/fusion-data');
}

// 监听 userStore 变化，确保 weightGroup 能及时更新
watch([userRolesRef, userInfoRef], () => {
  // 当 userRoles 或 userInfo 变化时，computed 会自动更新
  // 这里可以添加额外的逻辑，如果需要的话
}, { immediate: false, deep: true });

// 初始化加载
onMounted(async () => {
  
  // 如果 userStore 没有用户信息，尝试获取
  if (!userInfoRef.value) {
    try {
      await authStore.fetchUserInfo();
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  }
  
  // 初始化权值数据
  handleInitWeightData()
})

</script>

<template>
  <div>
    <WeightUpdate 
      :datasource="datasource"
      :total="total"
      :tree-data="treeData"
      :loading="loading"
      :weight-group="weightGroup"
      :isAdmin="isAdmin"
      :expert-options="expertOptions"
      @update:updateWeightTree="handleUpdateWeightTree"
      @update:loadData="handleLoadData"
      @update:upload="handleSubmitUpload"
      @update:fusionData="handleFusionData"
    />
  </div>
</template>

<style scoped>

</style>
