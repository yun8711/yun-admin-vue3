import { usePermissionStore } from '@/stores/permission'

// 按钮级权限：判断某个 menuKey 下是否拥有指定操作权限。
// 命名为 useAccess 以避免与 @vueuse/core 的 usePermission 冲突。
export function useAccess() {
  const permissionStore = usePermissionStore()

  function hasAction(menuKey: string, action: string): boolean {
    return permissionStore.hasAction(menuKey, action)
  }

  return { hasAction }
}
