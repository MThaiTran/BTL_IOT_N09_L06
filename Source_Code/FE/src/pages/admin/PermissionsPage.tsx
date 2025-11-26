import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI, rolesAPI, devicesAPI } from '../../services/api';
import { Role, User, UserRole, Device } from '../../types';
import toast from 'react-hot-toast';
import { ShieldCheck, KeyRound, Settings2 } from 'lucide-react';

interface CustomPermission {
  voiceControl: boolean;
}

type DevicePermissionMap = Record<number, number[]>;

function PermissionsPage() {
  const queryClient = useQueryClient();
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll().then((res) => res.data),
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesAPI.getAll().then((res) => res.data),
  });

  const { data: devices } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesAPI.getAll().then((res) => res.data),
  });

  const [customPermissions, setCustomPermissions] = useState<
    Record<number, CustomPermission>
  >({});
  const [devicePermissions, setDevicePermissions] = useState<DevicePermissionMap>({});
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, roleId }: { id: number; roleId: number }) =>
      usersAPI.update(id, { roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Cập nhật phân quyền thành công');
    },
    onError: () => toast.error('Cập nhật phân quyền thất bại'),
  });

  const ensureDevicePermissions = (user: User): number[] => {
    if (devicePermissions[user.id]) {
      return devicePermissions[user.id];
    }
    const defaults =
      user.roleId === UserRole.ADMIN || user.roleId === UserRole.TECHNICIAN
        ? devices?.map((d) => d.id) ?? []
        : devices?.filter((d) => d.userId === user.id).map((d) => d.id) ?? [];
    setDevicePermissions((prev) => ({ ...prev, [user.id]: defaults }));
    return defaults;
  };

  const handleRoleChange = (user: User, roleId: number) => {
    if (user.roleId === roleId) return;
    updateRoleMutation.mutate({ id: user.id, roleId });
    setDevicePermissions((prev) => {
      const defaults =
        roleId === UserRole.ADMIN || roleId === UserRole.TECHNICIAN
          ? devices?.map((d) => d.id) ?? []
          : prev[user.id] ?? [];
      return { ...prev, [user.id]: defaults };
    });
  };

  const togglePermission = (
    userId: number,
    key: keyof CustomPermission,
    value: boolean
  ) => {
    setCustomPermissions((prev) => ({
      ...prev,
      [userId]: {
        voiceControl: prev[userId]?.voiceControl ?? true,
        [key]: value,
      },
    }));
  };

  const toggleDevicePermission = (userId: number, deviceId: number, checked: boolean) => {
    setDevicePermissions((prev) => {
      const existing = prev[userId] ?? ensureDevicePermissions({ id: userId } as User);
      const next = checked
        ? Array.from(new Set([...existing, deviceId]))
        : existing.filter((id) => id !== deviceId);
      return { ...prev, [userId]: next };
    });
  };

  const getAllowedDevices = (user: User): Device[] => {
    const ids = devicePermissions[user.id] ?? ensureDevicePermissions(user);
    return devices?.filter((device) => ids.includes(device.id)) ?? [];
  };

  const deviceGroups = useMemo(() => {
    if (!devices) return {};
    return devices.reduce<Record<string, Device[]>>((acc, device) => {
      const key = device.location || 'Khác';
      acc[key] = acc[key] ? [...acc[key], device] : [device];
      return acc;
    }, {});
  }, [devices]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Phân quyền thành viên
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Owner/Admin có thể phân công quyền điều khiển cho các thành viên
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thành viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quyền điều khiển
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thiết bị được phép
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users?.map((user) => {
                const permissions = customPermissions[user.id] || {
                  voiceControl:
                    user.roleId !== UserRole.GUEST || user.roleId === UserRole.ADMIN,
                };

                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.roleId}
                        onChange={(e) => handleRoleChange(user, Number(e.target.value))}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-sm"
                      >
                        {roles?.map((role: Role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-primary-600"
                          checked={permissions.voiceControl}
                          onChange={(e) =>
                            togglePermission(user.id, 'voiceControl', e.target.checked)
                          }
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Cho phép điều khiển giọng nói
                        </span>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {getAllowedDevices(user).length > 0 ? (
                            getAllowedDevices(user).map((device) => (
                              <span
                                key={device.id}
                                className="px-3 py-1 text-xs rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300"
                              >
                                {device.name} • {device.location}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">
                              Chưa chọn thiết bị
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            setEditingUserId(editingUserId === user.id ? null : user.id)
                          }
                          className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                        >
                          <Settings2 size={14} />
                          {editingUserId === user.id ? 'Đóng' : 'Quản lý thiết bị'}
                        </button>
                        {editingUserId === user.id && (
                          <div className="mt-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 space-y-3 max-h-60 overflow-y-auto">
                            {Object.entries(deviceGroups).map(([location, group]) => (
                              <div key={location}>
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                                  {location}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                  {group.map((device) => {
                                    const allowed =
                                      (devicePermissions[user.id] ??
                                        ensureDevicePermissions(user)).includes(device.id);
                                    return (
                                      <label
                                        key={device.id}
                                        className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300"
                                      >
                                        <input
                                          type="checkbox"
                                          className="form-checkbox h-3.5 w-3.5 text-primary-600"
                                          checked={allowed}
                                          onChange={(e) =>
                                            toggleDevicePermission(
                                              user.id,
                                              device.id,
                                              e.target.checked
                                            )
                                          }
                                        />
                                        {device.name}
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="text-primary-600 dark:text-primary-300" />
            <h3 className="font-semibold text-primary-900 dark:text-primary-200">
              Quy tắc gợi ý
            </h3>
          </div>
          <ul className="text-sm text-primary-800 dark:text-primary-200 space-y-2">
            <li>• Admin có toàn quyền truy cập mọi thiết bị</li>
            <li>• Owner có thể giao quyền điều khiển cho thành viên</li>
            <li>• Technician chỉ nên có quyền OTA và thiết bị cần bảo trì</li>
            <li>• Guest chỉ nên được phép điều khiển những thiết bị cụ thể</li>
          </ul>
        </div>

        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <KeyRound className="text-gray-600 dark:text-gray-300" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Mẹo phân quyền
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Phân quyền rõ ràng giúp đảm bảo an toàn hệ thống. Bạn có thể điều chỉnh
            thiết bị được phép điều khiển cho từng thành viên để tránh thao tác nhầm.
            Mọi thay đổi sẽ được ghi lại trong logs.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PermissionsPage;

