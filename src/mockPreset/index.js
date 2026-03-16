import { globalInit } from '../preset';
import { getApis } from '@components/Apis';
import { enums as taskEnums } from '@components/Task';
import { enums as intlAdminEnums } from '@components/IntlAdmin';
import merge from 'lodash/merge';

import taskList from './task-list.json';
import signatureList from './signature-list.json';
import intlAdminData from './intl-admin-data.json';
import adminUserList from './admin-user-list.json';
import userInfo from './user-info.json';
import superAdminInfo from './super-admin-info.json';
import groupList from './group-list.json';
import tenantData from './tenant-data.json';
import tenantAdminData from './tenant-admin-data.json';

export { taskList, signatureList, intlAdminData, adminUserList, userInfo, superAdminInfo, groupList, tenantData, tenantAdminData };

const apis = merge({}, getApis(), {
  task: {
    list: {
      loader: () => {
        return import('./task-list.json').then(({ default: data }) => data.data);
      }
    },
    cancel: {
      loader: () => {
        return { code: 0, data: { success: true } };
      }
    },
    retry: {
      loader: () => {
        return { code: 0, data: { success: true } };
      }
    }
  },
  signature: {
    list: {
      loader: () => {
        return import('./signature-list.json').then(({ default: data }) => data.data);
      }
    },
    create: {
      loader: () => ({
        appId: `app_${Date.now()}`,
        secretKey: `sk_${Math.random().toString(36).substr(2, 32)}`
      })
    },
    update: {
      loader: () => ({ success: true })
    },
    remove: {
      loader: () => ({ success: true })
    },
    verify: {
      loader: () => ({ result: true, message: '验证成功' })
    }
  },
  intlAdmin: {
    langType: {
      list: {
        loader: () => {
          return import('./intl-admin-data.json').then(({ default: data }) => data.langType);
        }
      },
      create: {
        loader: () => ({ id: Date.now() })
      },
      save: {
        loader: () => ({ code: 0 })
      },
      remove: {
        loader: () => ({ code: 0 })
      },
      setStatus: {
        loader: () => ({ code: 0 })
      }
    },
    langLib: {
      list: {
        loader: () => {
          return import('./intl-admin-data.json').then(({ default: data }) => data.langLib);
        }
      },
      create: {
        loader: () => ({ id: Date.now() })
      },
      save: {
        loader: () => ({ code: 0 })
      },
      setStatus: {
        loader: () => ({ code: 0 })
      }
    }
  },
  admin: {
    getUserList: {
      loader: () => {
        return import('./admin-user-list.json').then(({ default: data }) => data);
      }
    },
    addUser: {
      loader: () => ({ id: Date.now() })
    },
    saveUser: {
      loader: () => ({ code: 0 })
    },
    resetUserPassword: {
      loader: () => ({ code: 0 })
    },
    setSuperAdmin: {
      loader: () => ({ code: 0 })
    },
    setUserNormal: {
      loader: () => ({ code: 0 })
    },
    setUserClose: {
      loader: () => ({ code: 0 })
    },
    getSuperAdminInfo: {
      loader: () => {
        return import('./super-admin-info.json').then(({ default: data }) => data.data);
      }
    },
    initSuperAdmin: {
      loader: () => ({ code: 0 })
    }
  },
  user: {
    getUserInfo: {
      loader: () => {
        return import('./user-info.json').then(({ default: data }) => data.data);
      }
    },
    saveUserInfo: {
      loader: () => ({ code: 0 })
    }
  },
  group: {
    list: {
      loader: () => {
        return import('./group-list.json').then(({ default: data }) => data.data);
      }
    },
    create: {
      loader: () => ({ id: Date.now(), code: Date.now() })
    },
    remove: {
      loader: () => ({ code: 0 })
    }
  },
  tenant: {
    availableList: {
      loader: () => {
        return import('./tenant-data.json').then(({ default: data }) => data.availableTenantList);
      }
    },
    switchDefaultTenant: {
      loader: () => ({ code: 0 })
    },
    getUserInfo: {
      loader: () => {
        return import('./tenant-data.json').then(({ default: data }) => ({
          tenantUserInfo: data.tenantUserInfo,
          company: data.company,
          tenant: data.tenantList.pageData[0],
          userInfo: data.tenantUserInfo
        }));
      }
    },
    companyDetail: {
      loader: () => {
        return import('./tenant-data.json').then(({ default: data }) => data.company);
      }
    },
    companySave: {
      loader: () => ({ code: 0 })
    },
    orgList: {
      loader: () => {
        return import('./tenant-data.json').then(({ default: data }) => data.orgList);
      }
    },
    orgCreate: {
      loader: () => ({ id: `dept-${Date.now()}` })
    },
    orgSave: {
      loader: () => ({ code: 0 })
    },
    orgRemove: {
      loader: () => ({ code: 0 })
    },
    userList: {
      loader: () => {
        return import('./tenant-data.json').then(({ default: data }) => data.userList);
      }
    },
    userCreate: {
      loader: () => ({ id: `user-${Date.now()}` })
    },
    userSave: {
      loader: () => ({ code: 0 })
    },
    userRemove: {
      loader: () => ({ code: 0 })
    },
    userSetStatus: {
      loader: () => ({ code: 0 })
    },
    userInviteToken: {
      loader: () => ({ token: `invite_${Date.now()}` })
    },
    userInviteMessage: {
      loader: () => ({ code: 0 })
    },
    role: {
      list: {
        loader: () => {
          return import('./tenant-data.json').then(({ default: data }) => data.roleList);
        }
      },
      create: {
        loader: () => ({ id: `role-${Date.now()}` })
      },
      save: {
        loader: () => ({ code: 0 })
      },
      setStatus: {
        loader: () => ({ code: 0 })
      },
      remove: {
        loader: () => ({ code: 0 })
      },
      permissionList: {
        loader: () => {
          return import('./tenant-data.json').then(({ default: data }) => data.permissionList);
        }
      },
      permissionSave: {
        loader: () => ({ code: 0 })
      }
    },
    permission: {
      list: {
        loader: () => {
          return import('./tenant-data.json').then(({ default: data }) => data.permissionList);
        }
      }
    },
    // 旧名称别名，兼容示例文件
    getUserList: {
      loader: () => {
        return import('./tenant-data.json').then(({ default: data }) => data.userList);
      }
    },
    createUser: {
      loader: () => ({ id: `user-${Date.now()}` })
    },
    saveUser: {
      loader: () => ({ code: 0 })
    },
    removeUser: {
      loader: () => ({ code: 0 })
    },
    getRoleList: {
      loader: () => {
        return import('./tenant-data.json').then(({ default: data }) => data.roleList);
      }
    },
    createRole: {
      loader: () => ({ id: `role-${Date.now()}` })
    },
    saveRole: {
      loader: () => ({ code: 0 })
    },
    removeRole: {
      loader: () => ({ code: 0 })
    },
    getPermissionList: {
      loader: () => {
        return import('./tenant-data.json').then(({ default: data }) => data.permissionList);
      }
    },
    savePermission: {
      loader: () => ({ code: 0 })
    },
    parseJoinToken: {
      loader: ({ data }) => {
        if (!data || !data.token || data.token === 'invalid') {
          return null;
        }
        return import('./tenant-data.json').then(({ default: data }) => ({
          tenant: data.tenantList.pageData[0],
          tenantUser: data.tenantUserInfo,
          company: data.company
        }));
      }
    },
    join: {
      loader: () => ({ code: 0 })
    }
  },
  file: {
    getUrl: {
      loader: ({ params }) => {
        if (params && params.id) {
          return params.id;
        }
        return 'https://picsum.photos/200/200';
      }
    }
  },
  tenantAdmin: {
    list: {
      loader: () => {
        return import('./tenant-admin-data.json').then(({ default: data }) => data.tenantList);
      }
    },
    detail: {
      loader: () => {
        return import('./tenant-admin-data.json').then(({ default: data }) => data.tenantDetail);
      }
    },
    create: {
      loader: () => ({ id: `tenant-${Date.now()}` })
    },
    save: {
      loader: () => ({ code: 0 })
    },
    remove: {
      loader: () => ({ code: 0 })
    },
    setStatus: {
      loader: () => ({ code: 0 })
    },
    companyDetail: {
      loader: () => {
        return import('./tenant-data.json').then(({ default: data }) => data.company);
      }
    },
    companySave: {
      loader: () => ({ code: 0 })
    },
    orgList: {
      loader: () => {
        return import('./tenant-data.json').then(({ default: data }) => data.orgList);
      }
    },
    orgCreate: {
      loader: () => ({ id: `dept-${Date.now()}` })
    },
    orgSave: {
      loader: () => ({ code: 0 })
    },
    orgRemove: {
      loader: () => ({ code: 0 })
    },
    userList: {
      loader: () => {
        return import('./tenant-data.json').then(({ default: data }) => data.userList);
      }
    },
    userCreate: {
      loader: () => ({ id: `user-${Date.now()}` })
    },
    userSave: {
      loader: () => ({ code: 0 })
    },
    userSetStatus: {
      loader: () => ({ code: 0 })
    },
    userInviteToken: {
      loader: () => ({ token: `invite_${Date.now()}` })
    },
    userInviteMessage: {
      loader: () => ({ code: 0 })
    },
    role: {
      list: {
        loader: () => {
          return import('./tenant-data.json').then(({ default: data }) => data.roleList);
        }
      },
      create: {
        loader: () => ({ id: `role-${Date.now()}` })
      },
      save: {
        loader: () => ({ code: 0 })
      },
      remove: {
        loader: () => ({ code: 0 })
      },
      setStatus: {
        loader: () => ({ code: 0 })
      },
      permissionList: {
        loader: () => {
          return import('./tenant-data.json').then(({ default: data }) => data.permissionList);
        }
      },
      permissionSave: {
        loader: () => ({ code: 0 })
      }
    },
    permission: {
      list: {
        loader: () => {
          return import('./tenant-data.json').then(({ default: data }) => data.permissionList);
        }
      },
      save: {
        loader: () => ({ code: 0 })
      }
    },
    appendArgs: {
      loader: () => ({ code: 0 })
    },
    removeArg: {
      loader: () => ({ code: 0 })
    },
    appendCustomComponent: {
      loader: () => ({ code: 0 })
    },
    customComponentDetail: {
      loader: () => ({ content: '<div>Custom Component</div>' })
    },
    saveCustomComponent: {
      loader: () => ({ code: 0 })
    },
    copyCustomComponent: {
      loader: () => ({ code: 0 })
    },
    removeCustomComponent: {
      loader: () => ({ code: 0 })
    }
  }
});

const enums = Object.assign({}, taskEnums, intlAdminEnums, {
  taskType: [
    { value: 'interview_report', description: '面试报告' },
    { value: 'data_export', description: '数据导出' },
    { value: 'email_notification', description: '邮件通知' },
    { value: 'video_processing', description: '视频处理' },
    { value: 'data_sync', description: '数据同步' },
    { value: 'report_generation', description: '报表生成' }
  ]
});

const preset = {
  ajax: async ({ loader, ...props }) => {
    if (!loader && props.url) {
      const { ajax } = await globalInit();
      return ajax({ loader, ...props });
    }
    return Promise.resolve({ data: loader ? { code: 0, data: loader() } : { code: 0, data: {} } });
  },
  apis,
  enums,
  global: tenantData.global
};

export default preset;
