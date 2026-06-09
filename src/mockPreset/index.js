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

const collectOrgSubtreeIds = (orgs, rootId) => {
  const ids = new Set([String(rootId)]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const org of orgs) {
      const id = String(org.id);
      const parentId = org.parentId != null && org.parentId !== '' ? String(org.parentId) : null;
      if (parentId && ids.has(parentId) && !ids.has(id)) {
        ids.add(id);
        changed = true;
      }
    }
  }
  return [...ids];
};

const normalizeTenantUserStatusFilter = status => {
  const s = status != null ? String(status).trim() : '';
  if (s === 'active') return 'open';
  if (s === 'inactive') return 'closed';
  if (s === 'open' || s === 'closed') return s;
  return '';
};

const loadFilteredTenantUserList = ({ params } = {}) =>
  import('./tenant-data.json').then(({ default: data }) => {
    const filter = params?.filter || {};
    let pageData = data.userList?.pageData || [];
    if (filter.tenantOrgId) {
      const orgIds = collectOrgSubtreeIds(data.orgList || [], filter.tenantOrgId);
      pageData = pageData.filter(item => {
        const ids = new Set();
        if (Array.isArray(item.tenantOrgIds)) {
          item.tenantOrgIds.forEach(id => ids.add(String(id)));
        }
        if (item.tenantOrg?.id) {
          ids.add(String(item.tenantOrg.id));
        }
        return [...ids].some(id => orgIds.includes(id));
      });
    }
    const statusFilter = normalizeTenantUserStatusFilter(filter.status);
    if (statusFilter) {
      pageData = pageData.filter(item => item.status === statusFilter);
    }
    if (filter.keyword) {
      const keyword = String(filter.keyword).toLowerCase();
      pageData = pageData.filter(item =>
        [item.name, item.email, item.phone].filter(Boolean).join(' ').toLowerCase().includes(keyword)
      );
    }
    return { pageData, totalCount: pageData.length };
  });

const loadFilteredRoleList = ({ params } = {}) =>
  import('./tenant-data.json').then(({ default: data }) => {
    const filter = params?.filter || {};
    let pageData = data.roleList.pageData || [];
    if (filter.type) {
      pageData = pageData.filter(item => item.type === filter.type);
    }
    if (filter.keyword) {
      const keyword = String(filter.keyword).toLowerCase();
      pageData = pageData.filter(
        item =>
          [item.name, item.code, item.description].filter(Boolean).join(' ').toLowerCase().indexOf(keyword) >= 0
      );
    }
    if (filter.status) {
      pageData = pageData.filter(item => item.status === filter.status);
    }
    return { pageData, totalCount: pageData.length };
  });

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
    },
    statistics: {
      getOverview: {
        loader: ({ params }) => {
          const range = params?.range || '7d';
          const now = new Date();
          const days = range === '1y' ? 365 : range === '3m' ? 90 : range === '1m' ? 30 : 7;
          const recentTrend = [];
          const recentTrendByStatus = [];
          const recentTrendByType = [];
          const durationTrend = [];
          const hourlyCompletionTrend = [];
          for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const success = Math.floor(Math.random() * 30) + 5;
            const failed = Math.floor(Math.random() * 8) + 1;
            const running = Math.floor(Math.random() * 5);
            const pending = Math.floor(Math.random() * 6) + 1;
            const canceled = Math.floor(Math.random() * 3);
            const total = success + failed + running + pending + canceled;
            recentTrend.push({ date: dateStr, count: total });
            recentTrendByStatus.push({ date: dateStr, status: 'success', count: success });
            recentTrendByStatus.push({ date: dateStr, status: 'failed', count: failed });
            recentTrendByStatus.push({ date: dateStr, status: 'running', count: running });
            recentTrendByStatus.push({ date: dateStr, status: 'pending', count: pending });
            recentTrendByStatus.push({ date: dateStr, status: 'canceled', count: canceled });
            recentTrendByType.push({ date: dateStr, type: 'export', count: Math.floor(total * 0.6) });
            recentTrendByType.push({ date: dateStr, type: 'import', count: Math.ceil(total * 0.4) });
            durationTrend.push({
              date: dateStr,
              completedCount: success + failed + canceled,
              successCount: success,
              failedCount: failed,
              canceledCount: canceled,
              avgWaitingTime: Math.floor(Math.random() * 3000) + 500,
              avgExecutionTime: Math.floor(Math.random() * 8000) + 2000,
              avgTotalTime: Math.floor(Math.random() * 10000) + 3000,
              byType: {
                export: { count: Math.floor(total * 0.6), avgWaitingTime: Math.floor(Math.random() * 2000) + 500, avgExecutionTime: Math.floor(Math.random() * 6000) + 2000, avgTotalTime: Math.floor(Math.random() * 8000) + 3000 },
                import: { count: Math.ceil(total * 0.4), avgWaitingTime: Math.floor(Math.random() * 2000) + 500, avgExecutionTime: Math.floor(Math.random() * 6000) + 2000, avgTotalTime: Math.floor(Math.random() * 8000) + 3000 }
              },
              byRunnerType: {
                manual: { count: Math.floor(total * 0.4), avgWaitingTime: Math.floor(Math.random() * 2000) + 500, avgExecutionTime: Math.floor(Math.random() * 6000) + 2000, avgTotalTime: Math.floor(Math.random() * 8000) + 3000 },
                system: { count: Math.ceil(total * 0.6), avgWaitingTime: Math.floor(Math.random() * 2000) + 500, avgExecutionTime: Math.floor(Math.random() * 6000) + 2000, avgTotalTime: Math.floor(Math.random() * 8000) + 3000 }
              },
              byTypeByRunnerType: {
                manual: {
                  export: { count: Math.floor(total * 0.25), avgWaitingTime: Math.floor(Math.random() * 2000) + 500, avgExecutionTime: Math.floor(Math.random() * 6000) + 2000, avgTotalTime: Math.floor(Math.random() * 8000) + 3000 },
                  import: { count: Math.ceil(total * 0.15), avgWaitingTime: Math.floor(Math.random() * 2000) + 500, avgExecutionTime: Math.floor(Math.random() * 6000) + 2000, avgTotalTime: Math.floor(Math.random() * 8000) + 3000 }
                },
                system: {
                  export: { count: Math.floor(total * 0.35), avgWaitingTime: Math.floor(Math.random() * 2000) + 500, avgExecutionTime: Math.floor(Math.random() * 6000) + 2000, avgTotalTime: Math.floor(Math.random() * 8000) + 3000 },
                  import: { count: Math.ceil(total * 0.25), avgWaitingTime: Math.floor(Math.random() * 2000) + 500, avgExecutionTime: Math.floor(Math.random() * 6000) + 2000, avgTotalTime: Math.floor(Math.random() * 8000) + 3000 }
                }
              }
            });
            ['import', 'export'].forEach(type => {
              [9, 12, 15, 18].forEach(h => {
                const ok = Math.floor(Math.random() * 3) + 1;
                const bad = Math.random() < 0.15 ? 1 : 0;
                hourlyCompletionTrend.push({
                  date: dateStr,
                  hour: h,
                  type,
                  runnerType: type === 'import' ? 'system' : 'manual',
                  totalCompleted: ok + bad,
                  successCount: ok,
                  failedCount: bad,
                  canceledCount: 0
                });
              });
            });
          }
          const totalSuccess = recentTrendByStatus.filter(item => item.status === 'success').reduce((sum, item) => sum + item.count, 0);
          const totalFailed = recentTrendByStatus.filter(item => item.status === 'failed').reduce((sum, item) => sum + item.count, 0);
          const totalRunning = recentTrendByStatus.filter(item => item.status === 'running').reduce((sum, item) => sum + item.count, 0);
          const totalPending = recentTrendByStatus.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.count, 0);
          const totalCanceled = recentTrendByStatus.filter(item => item.status === 'canceled').reduce((sum, item) => sum + item.count, 0);
          const totalWaiting = recentTrendByStatus.filter(item => item.status === 'waiting').reduce((sum, item) => sum + item.count, 0);
          return {
            range,
            rangeLabel: range === '7d' ? '近7天' : range === '1m' ? '近1个月' : range === '3m' ? '近3个月' : '近1年',
            totalTasks: totalSuccess + totalFailed + totalRunning + totalPending + totalCanceled + totalWaiting,
            byStatus: { success: totalSuccess, failed: totalFailed, running: totalRunning, pending: totalPending, canceled: totalCanceled, waiting: totalWaiting },
            byType: { export: Math.floor((totalSuccess + totalFailed) * 0.6), import: Math.ceil((totalSuccess + totalFailed) * 0.4) },
            byRunnerType: { manual: Math.floor((totalSuccess + totalFailed) * 0.4), system: Math.ceil((totalSuccess + totalFailed) * 0.6) },
            byTargetType: { project: Math.floor((totalSuccess + totalFailed) * 0.5), document: Math.ceil((totalSuccess + totalFailed) * 0.5) },
            recentTrend,
            recentTrendByStatus,
            recentTrendByType,
            durationTrend,
            hourlyCompletionTrend
          };
        }
      },
      sse: {
        loader: () => {
          const now = new Date();
          const currentHour = now.getHours();
          const hourlyTrend = [];
          const hourlyTrendByStatus = [];
          const hourlyTrendByType = [];
          for (let h = 0; h <= currentHour; h++) {
            const success = Math.floor(Math.random() * 6) + 1;
            const failed = Math.floor(Math.random() * 3);
            const running = Math.floor(Math.random() * 2);
            const pending = Math.floor(Math.random() * 3);
            const waiting = Math.floor(Math.random() * 2);
            const canceled = Math.floor(Math.random() * 2);
            const total = success + failed + running + pending + waiting + canceled;
            const exportCount = Math.floor(total * 0.6);
            const importCount = total - exportCount;
            hourlyTrend.push({ hour: h, count: total });
            if (success > 0) hourlyTrendByStatus.push({ hour: h, status: 'success', count: success });
            if (failed > 0) hourlyTrendByStatus.push({ hour: h, status: 'failed', count: failed });
            if (running > 0) hourlyTrendByStatus.push({ hour: h, status: 'running', count: running });
            if (pending > 0) hourlyTrendByStatus.push({ hour: h, status: 'pending', count: pending });
            if (waiting > 0) hourlyTrendByStatus.push({ hour: h, status: 'waiting', count: waiting });
            if (canceled > 0) hourlyTrendByStatus.push({ hour: h, status: 'canceled', count: canceled });
            if (exportCount > 0) hourlyTrendByType.push({ hour: h, type: 'export', count: exportCount });
            if (importCount > 0) hourlyTrendByType.push({ hour: h, type: 'import', count: importCount });
          }
          const totalTasks = hourlyTrend.reduce((sum, item) => sum + item.count, 0);
          const totalSuccess = hourlyTrendByStatus.filter(item => item.status === 'success').reduce((sum, item) => sum + item.count, 0);
          const totalFailed = hourlyTrendByStatus.filter(item => item.status === 'failed').reduce((sum, item) => sum + item.count, 0);
          const totalRunning = hourlyTrendByStatus.filter(item => item.status === 'running').reduce((sum, item) => sum + item.count, 0);
          const totalPending = hourlyTrendByStatus.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.count, 0);
          const totalWaiting = hourlyTrendByStatus.filter(item => item.status === 'waiting').reduce((sum, item) => sum + item.count, 0);
          const totalCanceled = hourlyTrendByStatus.filter(item => item.status === 'canceled').reduce((sum, item) => sum + item.count, 0);
          const manualWaiting = Math.max(0, Math.floor(totalWaiting * 0.5));
          const systemWaiting = Math.max(0, totalWaiting - manualWaiting);
          const manualCompletedToday = Math.max(0, Math.floor(totalSuccess * 0.35));
          const systemCompletedToday = Math.max(0, totalSuccess - manualCompletedToday);
          // 看板 KPI：waiting 用 waitingByRunnerType；当日完成仅用顶层 completedToday（见 Task doc/api.md）
          return {
            date: now.toISOString().split('T')[0],
            totalTasks,
            byStatus: {
              success: totalSuccess,
              failed: totalFailed,
              running: totalRunning,
              pending: totalPending,
              waiting: totalWaiting,
              canceled: totalCanceled
            },
            byType: { export: Math.floor(totalTasks * 0.6), import: Math.ceil(totalTasks * 0.4) },
            byRunnerType: { manual: Math.floor(totalTasks * 0.4), system: Math.ceil(totalTasks * 0.6) },
            hourlyTrend,
            hourlyTrendByStatus,
            hourlyTrendByType,
            waitingByRunnerType: {
              manual: manualWaiting,
              system: systemWaiting
            },
            completedToday: {
              manual: manualCompletedToday,
              system: systemCompletedToday
            },
            waitingQueueMaxWaitMsByRunnerType: {
              manual: manualWaiting > 0 ? 180000 + Math.floor(Math.random() * 240000) : 0,
              system: systemWaiting > 0 ? 120000 + Math.floor(Math.random() * 180000) : 0
            },
            completedTodayTotalDurationMsByRunnerType: {
              manual: manualCompletedToday * (90000 + Math.floor(Math.random() * 120000)),
              system: systemCompletedToday * 60000
            },
            pendingByRunnerType: {
              manual: Math.max(0, Math.floor(totalPending * 0.45)),
              system: Math.max(0, totalPending - Math.floor(totalPending * 0.45))
            },
            runnerTypeStats: (() => {
              const manualTotal = Math.floor(totalTasks * 0.4);
              const systemTotal = Math.ceil(totalTasks * 0.6);
              const manualPending = Math.max(0, Math.floor(totalPending * 0.45));
              const systemPending = Math.max(0, totalPending - Math.floor(totalPending * 0.45));
              return {
                manual: {
                  total: manualTotal,
                  pending: manualPending,
                  executed: Math.max(0, manualTotal - manualPending),
                  waiting: manualWaiting
                },
                system: {
                  total: systemTotal,
                  pending: systemPending,
                  executed: Math.max(0, systemTotal - systemPending),
                  waiting: systemWaiting
                }
              };
            })(),
            todayDuration: {
              completedCount: totalSuccess + totalFailed + totalCanceled,
              successCount: totalSuccess,
              failedCount: totalFailed,
              canceledCount: totalCanceled,
              avgWaitingTime: Math.floor(Math.random() * 3000) + 500,
              avgExecutionTime: Math.floor(Math.random() * 8000) + 2000,
              avgTotalTime: Math.floor(Math.random() * 10000) + 3000,
              byType: {
                export: {
                  count: Math.max(1, Math.floor(totalSuccess * 0.35)),
                  avgWaitingTime: 800,
                  avgExecutionTime: 2200,
                  avgTotalTime: 3200
                },
                import: {
                  count: Math.max(1, Math.floor(totalSuccess * 0.25)),
                  avgWaitingTime: 1200,
                  avgExecutionTime: 3100,
                  avgTotalTime: 4500
                }
              },
              byTypeByRunnerType: {
                manual: {
                  export: { count: 2, avgWaitingTime: 900, avgExecutionTime: 2000, avgTotalTime: 3000 },
                  import: { count: 1, avgWaitingTime: 1100, avgExecutionTime: 2800, avgTotalTime: 4000 }
                },
                system: {
                  export: { count: 4, avgWaitingTime: 700, avgExecutionTime: 2400, avgTotalTime: 3400 },
                  import: { count: 3, avgWaitingTime: 1300, avgExecutionTime: 3300, avgTotalTime: 4800 }
                }
              }
            }
          };
        }
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
    orgBatchImport: {
      loader: () => ({
        code: 0,
        data: { createdOrgs: 2, createdUsers: 1, reusedUsers: 0, rowCount: 2 }
      })
    },
    userList: {
      loader: loadFilteredTenantUserList
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
        loader: loadFilteredRoleList
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
    sharedGroup: {
      list: {
        loader: () => {
          return import('./tenant-data.json').then(({ default: data }) => data.sharedGroupList);
        }
      },
      create: {
        loader: () => ({ id: `sg-${Date.now()}` })
      },
      save: {
        loader: () => ({ code: 0 })
      },
      setStatus: {
        loader: () => ({ code: 0 })
      },
      remove: {
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
      loader: loadFilteredTenantUserList
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
      loader: loadFilteredRoleList
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
    getSharedGroupList: {
      loader: () => {
        return import('./tenant-data.json').then(({ default: data }) => data.sharedGroupList);
      }
    },
    createSharedGroup: {
      loader: () => ({ id: `sg-${Date.now()}` })
    },
    saveSharedGroup: {
      loader: () => ({ code: 0 })
    },
    removeSharedGroup: {
      loader: () => ({ code: 0 })
    },
    setSharedGroupStatus: {
      loader: () => ({ code: 0 })
    },
    parseJoinToken: {
      loader: ({ data }) => {
        if (!data || !data.token || data.token === 'invalid') {
          return null;
        }
        return import('./tenant-data.json').then(({ default: data }) => {
          const sampleUser = data.userList.pageData[0];
          const positionName = sampleUser?.position;
          return {
            tenant: data.tenantList.pageData[0],
            tenantUser: Object.assign({}, data.tenantUserInfo, {
              roles: sampleUser?.roles,
              position: positionName,
              options: positionName ? { position: positionName } : {},
              tenantOrg: sampleUser?.tenantOrg,
              tenantOrgs: sampleUser?.tenantOrgs
            }),
            company: data.company,
            positionList: positionName ? [{ id: 'mock-position', name: positionName }] : []
          };
        });
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
    orgBatchImport: {
      loader: () => ({
        code: 0,
        data: { createdOrgs: 2, createdUsers: 1, reusedUsers: 0, rowCount: 2 }
      })
    },
    userList: {
      loader: loadFilteredTenantUserList
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
        loader: loadFilteredRoleList
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
    sharedGroup: {
      list: {
        loader: () => {
          return import('./tenant-data.json').then(({ default: data }) => data.sharedGroupList);
        }
      },
      create: {
        loader: () => ({ id: `sg-${Date.now()}` })
      },
      save: {
        loader: () => ({ code: 0 })
      },
      setStatus: {
        loader: () => ({ code: 0 })
      },
      remove: {
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
      },
      send: {
        loader: () => ({ code: 0, data: { id: `record_${Date.now()}` } })
      }
    },
    statistics: {
      getOverview: {
        loader: ({ params }) => {
          const range = params?.range || '7d';
          const now = new Date();
          const days = range === '1y' ? 365 : range === '3m' ? 90 : range === '1m' ? 30 : 7;
          const recentTrend = [];
          const recentTrendByType = [];
          for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const emailCount = Math.floor(Math.random() * 30) + 5;
            const smsCount = Math.floor(Math.random() * 15) + 1;
            recentTrend.push({ date: dateStr, count: emailCount + smsCount });
            recentTrendByType.push({ date: dateStr, type: 0, count: emailCount });
            recentTrendByType.push({ date: dateStr, type: 1, count: smsCount });
          }
          const totalRecords = recentTrend.reduce((sum, item) => sum + item.count, 0);
          const emailTotal = recentTrendByType.filter(item => item.type === 0).reduce((sum, item) => sum + item.count, 0);
          const smsTotal = recentTrendByType.filter(item => item.type === 1).reduce((sum, item) => sum + item.count, 0);
          return {
            range,
            rangeLabel: range === '7d' ? '近7天' : range === '1m' ? '近1个月' : range === '3m' ? '近3个月' : '近1年',
            totalRecords,
            byType: { '0': emailTotal, '1': smsTotal },
            byCode: { welcome: Math.floor(totalRecords * 0.4), verify: Math.floor(totalRecords * 0.3), notification: Math.floor(totalRecords * 0.2), alert: totalRecords - Math.floor(totalRecords * 0.4) - Math.floor(totalRecords * 0.3) - Math.floor(totalRecords * 0.2) },
            templateStats: {
              total: messageMangerData.templates.pageData.length,
              byStatus: { '0': messageMangerData.templates.pageData.filter(t => Number(t.status) === 0).length, '1': messageMangerData.templates.pageData.filter(t => Number(t.status) === 1).length },
              byType: { '0': messageMangerData.templates.pageData.filter(t => Number(t.type) === 0).length, '1': messageMangerData.templates.pageData.filter(t => Number(t.type) === 1).length }
            },
            recentTrend,
            recentTrendByType
          };
        }
      },
      sse: {
        loader: () => {
          const now = new Date();
          const currentHour = now.getHours();
          const hourlyTrend = [];
          const hourlyTrendByType = [];
          for (let h = 0; h <= currentHour; h++) {
            const email = Math.floor(Math.random() * 8) + 2;
            const sms = Math.floor(Math.random() * 4);
            hourlyTrend.push({ hour: h, count: email + sms });
            hourlyTrendByType.push({ hour: h, type: 0, count: email });
            if (sms > 0) hourlyTrendByType.push({ hour: h, type: 1, count: sms });
          }
          const totalRecords = hourlyTrend.reduce((sum, item) => sum + item.count, 0);
          const emailTotal = hourlyTrendByType.filter(item => item.type === 0).reduce((sum, item) => sum + item.count, 0);
          const smsTotal = hourlyTrendByType.filter(item => item.type === 1).reduce((sum, item) => sum + item.count, 0);
          return {
            date: now.toISOString().split('T')[0],
            totalRecords,
            byType: { '0': emailTotal, '1': smsTotal },
            byCode: { welcome: Math.floor(totalRecords * 0.4), verify: Math.floor(totalRecords * 0.3), notification: totalRecords - Math.floor(totalRecords * 0.4) - Math.floor(totalRecords * 0.3) },
            hourlyTrend,
            hourlyTrendByType,
            intervalTrend: [],
            records: [
              {
                id: 'mock_record_1',
                name: 'demo@example.com',
                type: 0,
                code: 'welcome',
                createdAt: now.toISOString()
              }
            ]
          };
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
