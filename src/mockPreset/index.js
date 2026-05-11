import { globalInit } from '../preset';
import { getApis } from '@components/Apis';
import { enums as taskEnums } from '@components/Task';
import { enums as intlAdminEnums } from '@components/IntlAdmin';
import merge from 'lodash/merge';
import { filterPageData } from '@components/MessageQueue/utils';
import { filterMessagePageData } from '@components/MessageManger/utils';

import taskList from './task-list.json';
import signatureList from './signature-list.json';
import intlAdminData from './intl-admin-data.json';
import adminUserList from './admin-user-list.json';
import userInfo from './user-info.json';
import superAdminInfo from './super-admin-info.json';
import groupList from './group-list.json';
import tenantData from './tenant-data.json';
import tenantAdminData from './tenant-admin-data.json';
import messageQueueList from './message-queue-list.json';
import deadLetterList from './dead-letter-list.json';
import traceList from './trace-list.json';
import messageMangerData from './message-manger-data.json';

export { taskList, signatureList, intlAdminData, adminUserList, userInfo, superAdminInfo, groupList, tenantData, tenantAdminData, messageQueueList, deadLetterList, traceList, messageMangerData };

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
  },
  messageManger: {
    records: {
      list: {
        loader: ({ params }) => {
          return filterMessagePageData({
            pageData: messageMangerData.records.pageData,
            params,
            filters: {
              type: (item, value) => Number(item.type) === Number(value),
              code: (item, value) => item.code === value,
              name: (item, value) => item.name === value
            }
          });
        }
      },
      detail: {
        loader: ({ params }) => {
          return messageMangerData.records.pageData.find(item => String(item.id) === String(params?.id));
        }
      }
    },
    templates: {
      list: {
        loader: ({ params }) => {
          return filterMessagePageData({
            pageData: messageMangerData.templates.pageData,
            params,
            filters: {
              type: (item, value) => Number(item.type) === Number(value),
              code: (item, value) => item.code === value,
              level: (item, value) => Number(item.level) === Number(value),
              status: (item, value) => Number(item.status) === Number(value)
            }
          });
        }
      },
      detail: {
        loader: ({ params }) => {
          return messageMangerData.templates.pageData.find(item => String(item.id) === String(params?.id));
        }
      }
    }
  },
  mq: {
    message: {
      publish: {
        loader: ({ data }) => ({
          id: `msg_${Date.now()}`,
          traceId: data?.traceId || `trace_${Date.now()}`,
          status: 'PENDING',
          ...data
        })
      },
      list: {
        loader: ({ params }) => {
          return filterPageData({
            pageData: messageQueueList.pageData,
            params,
            filters: {
              topic: (item, value) => item.topic === value,
              status: (item, value) => item.status === value,
              traceId: (item, value) => item.traceId === value
            }
          });
        }
      }
    },
    deadLetter: {
      list: {
        loader: ({ params }) => {
          return filterPageData({
            pageData: deadLetterList.pageData,
            params,
            filters: {
              topic: (item, value) => item.topic === value,
              replayed: (item, value) => item.replayed === value
            }
          });
        }
      },
      replay: {
        loader: ({ data }) => {
          if (Array.isArray(data?.ids) && data.ids.length > 0) {
            return data.ids.map(id => ({ id, success: true, messageId: `msg_replay_${Date.now()}` }));
          }
          return {
            id: `msg_replay_${Date.now()}`,
            originalDeadLetterId: data?.id,
            status: 'PENDING'
          };
        }
      }
    },
    trace: {
      list: {
        loader: ({ params }) => {
          return filterPageData({
            pageData: traceList.pageData,
            params,
            filters: {
              topic: (item, value) => item.topic === value,
              messageId: (item, value) => item.messageId === value,
              event: (item, value) => item.event === value
            }
          });
        }
      },
      detail: {
        loader: ({ params }) => {
          const traceId = params?.traceId || 'trace_abc123';
          return traceList.pageData.filter(item => item.traceId === traceId);
        }
      }
    },
    dashboard: {
      getData: {
        loader: () => ({
          timestamp: Date.now(),
          current: {
            queueDepth: { byTopic: { 'order.created': 5, 'user.registered': 2, 'payment.completed': 1 }, total: 8 },
            consumedTotal: { byTopic: { 'order.created': 100, 'user.registered': 50 }, total: 150 },
            failedTotal: { byTopic: { 'email.send': 2, 'file.process': 1 }, total: 3 },
            dlqTotal: { byTopic: { 'email.send': 2, 'file.process': 1 }, total: 3 },
            consumeRate: { byTopic: { 'order.created': 0.5, 'user.registered': 0.3 }, total: 0.8 },
            failureRate: { byTopic: { 'email.send': 0.02 }, total: 0.02 },
            dlqRate: { byTopic: { 'email.send': 0.01 }, total: 0.01 },
            successRatio: 0.96,
            successRatioByTopic: { 'order.created': 0.96, 'user.registered': 0.98 }
          },
          timeSeries: {
            queueDepth: [
              { timestamp: Date.now() - 300000, 'order.created': 8, 'user.registered': 3 },
              { timestamp: Date.now() - 240000, 'order.created': 7, 'user.registered': 2 },
              { timestamp: Date.now() - 180000, 'order.created': 6, 'user.registered': 2 },
              { timestamp: Date.now() - 120000, 'order.created': 5, 'user.registered': 2 },
              { timestamp: Date.now() - 60000, 'order.created': 5, 'user.registered': 1 },
              { timestamp: Date.now(), 'order.created': 5, 'user.registered': 2 }
            ],
            consumeRate: [
              { timestamp: Date.now() - 300000, 'order.created': 0.5, 'user.registered': 0.3 },
              { timestamp: Date.now() - 240000, 'order.created': 0.6, 'user.registered': 0.2 },
              { timestamp: Date.now() - 180000, 'order.created': 0.4, 'user.registered': 0.4 },
              { timestamp: Date.now() - 120000, 'order.created': 0.5, 'user.registered': 0.3 },
              { timestamp: Date.now() - 60000, 'order.created': 0.5, 'user.registered': 0.3 },
              { timestamp: Date.now(), 'order.created': 0.5, 'user.registered': 0.3 }
            ],
            failureRate: [
              { timestamp: Date.now() - 300000, 'email.send': 0.02 },
              { timestamp: Date.now() - 240000, 'email.send': 0.01 },
              { timestamp: Date.now() - 180000, 'email.send': 0.03 },
              { timestamp: Date.now() - 120000, 'email.send': 0.02 },
              { timestamp: Date.now() - 60000, 'email.send': 0.01 },
              { timestamp: Date.now(), 'email.send': 0.02 }
            ],
            dlqRate: [
              { timestamp: Date.now() - 300000, 'email.send': 0.01 },
              { timestamp: Date.now() - 240000, 'email.send': 0.005 },
              { timestamp: Date.now() - 180000, 'email.send': 0.015 },
              { timestamp: Date.now() - 120000, 'email.send': 0.01 },
              { timestamp: Date.now() - 60000, 'email.send': 0.005 },
              { timestamp: Date.now(), 'email.send': 0.01 }
            ]
          }
        })
      }
    },
    queue: {
      depth: {
        loader: ({ params }) => {
          const list = messageQueueList.pageData.filter(item => item.status === 'PENDING' && (!params?.topic || item.topic === params.topic));
          return { depth: list.length };
        }
      },
      cleanup: {
        loader: () => ({ deleted: 3 })
      }
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
  ],
  messageStatus: [
    { value: 'PENDING', description: '等待执行', type: 'info' },
    { value: 'PROCESSING', description: '处理中', type: 'progress' },
    { value: 'COMPLETED', description: '已完成', type: 'success' },
    { value: 'FAILED', description: '失败', type: 'danger' }
  ],
  traceEvent: [
    { value: 'PUBLISHED', description: '消息发布', type: 'info' },
    { value: 'PROCESSING', description: '开始处理', type: 'progress' },
    { value: 'COMPLETED', description: '处理完成', type: 'success' },
    { value: 'FAILED', description: '处理失败', type: 'danger' },
    { value: 'MOVED_TO_DLQ', description: '进入死信', type: 'danger' },
    { value: 'REPLAYED', description: '死信重放', type: 'success' },
    { value: 'LOCK_RECOVERED', description: '锁定恢复', type: 'info' }
  ],
  mqBoolean: [
    { value: true, description: '是', type: 'success' },
    { value: false, description: '否', type: 'info' }
  ],
  messageManagerType: [
    { value: 0, description: '邮件', type: 'info' },
    { value: 1, description: '短信', type: 'success' }
  ],
  messageTemplateLevel: [
    { value: 0, description: '系统', type: 'info' },
    { value: 1, description: '业务', type: 'progress' }
  ],
  messageTemplateStatus: [
    { value: 0, description: '启用', type: 'success' },
    { value: 1, description: '禁用', type: 'info' }
  ],
  yesNo: [
    { value: 'yes', description: '是' },
    { value: 'no', description: '否' }
  ]
});

const preset = {
  ajax: async ({ loader, ...props }) => {
    if (!loader && props.url) {
      const { ajax } = await globalInit();
      return ajax({ loader, ...props });
    }
    return Promise.resolve({ data: loader ? { code: 0, data: loader(props) } : { code: 0, data: {} } });
  },
  apis,
  enums,
  global: tenantData.global
};

export default preset;
