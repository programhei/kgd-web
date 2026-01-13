interface BasicOption {
  label: string;
  value: string;
}

type SelectOption = BasicOption;

type TabOption = BasicOption;

interface BasicUserInfo {
  /**
   * 头像
   */
  avatar: string;
  /**
   * 用户昵称
   */
  realName: string;
  /**
   * 用户角色
   */
  roles?: string[];
  /**
   * 用户id
   */
  userId: string;
  /**
   * 用户名
   */
  username: string;
}

type ClassType = Array<object | string> | object | string;

interface BasicRoleInfo {

  /** 角色ID */
  roleId: number;

  /** 角色名称 */
  roleName: string;

  /** 角色权限 */
  roleKey: string;

  /** 角色排序 */
  roleSort: number;

  /** 数据范围（1：所有数据权限；2：自定义数据权限；3：本部门数据权限；4：本部门及以下数据权限；5：仅本人数据权限） */
  dataScope: string;

  /** 菜单树选择项是否关联显示（ 0：父子不互相关联显示 1：父子互相关联显示） */
  menuCheckStrictly: boolean;

  /** 部门树选择项是否关联显示（0：父子不互相关联显示 1：父子互相关联显示 ） */
  deptCheckStrictly: boolean;

  /** 角色状态（0正常 1停用） */
  status: string;

  /** 删除标志（0代表存在 2代表删除） */
  delFlag: string;

  /** 用户是否存在此角色标识 默认不存在 */
  flag?: boolean;

  /** 菜单组 */
  menuIds?: number[];

  /** 部门组（数据权限） */
  deptIds?: number[];

  /** 角色菜单权限 */
  permissions?: string[];
}

export type {BasicOption, BasicUserInfo,BasicRoleInfo, ClassType, SelectOption, TabOption};
