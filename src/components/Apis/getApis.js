const getApis = options => {
  const { prefix } = Object.assign(
    {},
    {
      prefix: `/api/v1`
    },
    options
  );
  return {
    user: {
      getUserInfo: {
        url: `${prefix}/user/getUserInfo`,
        method: 'GET',
        cache: 'get-user-info'
      },
      saveUserInfo: {
        url: `${prefix}/user/saveUserInfo`,
        method: 'POST'
      }
    },
    account: {
      sendSMSCode: {
        url: `${prefix}/account/sendSMSCode`,
        method: 'POST'
      },
      sendEmailCode: {
        url: `${prefix}/account/sendEmailCode`,
        method: 'POST'
      },
      register: {
        url: `${prefix}/account/register`,
        method: 'POST'
      },
      login: {
        url: `${prefix}/account/login`,
        method: 'POST'
      },
      modifyPassword: {
        url: `${prefix}/account/modifyPassword`,
        method: 'POST'
      },
      forgetPwd: {
        url: `${prefix}/account/forgetPwd`,
        method: 'POST'
      },
      parseResetToken: {
        url: `${prefix}/account/parseResetToken`,
        method: 'POST'
      },
      resetPassword: {
        url: `${prefix}/account/resetPassword`,
        method: 'POST'
      },
      validateCode: {
        url: `${prefix}/account/validateCode`,
        method: 'POST'
      },
      accountIsExists: {
        url: `${prefix}/account/accountIsExists`,
        method: 'POST'
      }
    },
    admin: {
      getSuperAdminInfo: {
        url: `${prefix}/admin/getSuperAdminInfo`,
        method: 'GET'
      },
      initSuperAdmin: {
        url: `${prefix}/admin/initSuperAdmin`,
        method: 'POST'
      },
      getUserList: {
        url: `${prefix}/admin/getUserList`,
        method: 'GET'
      },
      saveUser: {
        url: `${prefix}/admin/saveUser`,
        method: 'POST'
      },
      addUser: {
        url: `${prefix}/admin/addUser`,
        method: 'POST'
      },
      resetUserPassword: {
        url: `${prefix}/admin/resetUserPassword`,
        method: 'POST'
      },
      setSuperAdmin: {
        url: `${prefix}/admin/setSuperAdmin`,
        method: 'POST'
      },
      setUserClose: {
        url: `${prefix}/admin/setUserClose`,
        method: 'POST'
      },
      setUserNormal: {
        url: `${prefix}/admin/setUserNormal`,
        method: 'POST'
      }
    },
    signature: {
      list: {
        method: 'GET',
        url: `${prefix}/signature/list`
      },
      create: {
        method: 'POST',
        url: `${prefix}/signature/create`
      },
      update: {
        method: 'POST',
        url: `${prefix}/signature/update`
      },
      remove: {
        method: 'POST',
        url: `${prefix}/signature/remove`
      },
      verify: {
        method: 'POST',
        url: `${prefix}/signature/verify`
      }
    },
    webhook: {
      list: {
        url: `${prefix}/webhook/list`,
        method: 'GET'
      },
      create: {
        url: `${prefix}/webhook/create`,
        method: 'POST'
      },
      setStatus: {
        url: `${prefix}/webhook/set-status`,
        method: 'POST'
      },
      invoke: {
        url: `${prefix}/webhook/invoke`,
        method: 'POST'
      },
      invokeRecord: {
        url: `${prefix}/webhook/invoke-record`,
        method: 'GET'
      },
      remove: {
        url: `${prefix}/webhook/remove`,
        method: 'POST'
      }
    },
    task: {
      complete: {
        url: `${prefix}/task/complete`,
        method: 'POST'
      },
      cancel: {
        url: `${prefix}/task/cancel`,
        method: 'POST'
      },
      list: {
        url: `${prefix}/task/list`,
        method: 'GET'
      },
      retry: {
        url: `${prefix}/task/retry`,
        method: 'POST'
      },
      statistics: {
        /**
         * 历史统计看板（GET）。
         * Query：`range`（7d|1m|1y）、`timezone`（IANA，与「今日」划界一致）。
         * 响应字段约定见 `src/components/Task/doc/api.md`「任务统计 HTTP」。
         */
        getOverview: {
          url: `${prefix}/task/statistics`,
          method: 'GET'
        },
        /**
         * 实时统计（Server-Sent Events，GET）。
         * Query：`interval`、`token`、`timezone`（见 `useRealtimeStatisticsSSE` 与 Task `getClientIanaTimezone`）。
         * 每条 `message` 的 `data` 为 JSON 对象（或 `{ data: {...} }` 包裹），字段约定见 `src/components/Task/doc/api.md`「任务实时统计 SSE」。
         * 看板手动区：条数用 `waitingByRunnerType.manual` / `completedToday.manual`；主时长用
         * `waitingQueueMaxWaitMsByRunnerType.manual`（队列最长等待）、`completedTodayTotalDurationMsByRunnerType.manual`（当日完成创建→完成之和）。
         */
        sse: {
          url: `${prefix}/task/statistics/sse`,
          method: 'GET'
        }
      }
    },
    tenantAdmin: {
      create: {
        url: `${prefix}/tenant/admin/create`,
        method: 'POST'
      },
      list: {
        url: `${prefix}/tenant/admin/list`,
        method: 'GET'
      },
      save: {
        url: `${prefix}/tenant/admin/save`,
        method: 'POST'
      },
      setStatus: {
        url: `${prefix}/tenant/admin/set-status`,
        method: 'POST'
      },
      remove: {
        url: `${prefix}/tenant/admin/remove`,
        method: 'POST'
      },
      detail: {
        url: `${prefix}/tenant/admin/detail`,
        method: 'GET'
      },
      companyDetail: {
        url: `${prefix}/tenant/admin/company-detail`,
        method: 'GET'
      },
      companySave: {
        url: `${prefix}/tenant/admin/company-save`,
        method: 'POST'
      },
      orgList: {
        url: `${prefix}/tenant/admin/org-list`,
        method: 'GET'
      },
      orgCreate: {
        url: `${prefix}/tenant/admin/org-create`,
        method: 'POST'
      },
      orgSave: {
        url: `${prefix}/tenant/admin/org-save`,
        method: 'POST'
      },
      orgRemove: {
        url: `${prefix}/tenant/admin/org-remove`,
        method: 'POST'
      },
      userList: {
        url: `${prefix}/tenant/admin/user-list`,
        method: 'GET'
      },
      userCreate: {
        url: `${prefix}/tenant/admin/user-create`,
        method: 'POST'
      },
      userSetStatus: {
        url: `${prefix}/tenant/admin/user-set-status`,
        method: 'POST'
      },
      userSave: {
        url: `${prefix}/tenant/admin/user-save`,
        method: 'POST'
      },
      userRemove: {
        url: `${prefix}/tenant/admin/user-remove`,
        method: 'POST'
      },
      userInviteToken: {
        url: `${prefix}/tenant/admin/user-invite-token`,
        method: 'GET'
      },
      userInviteMessage: {
        url: `${prefix}/tenant/admin/send-invite-message`,
        method: 'POST'
      },
      appendArgs: {
        url: `${prefix}/tenant/admin/append-args`,
        method: 'POST'
      },
      appendCustomComponent: {
        url: `${prefix}/tenant/admin/append-custom-component`,
        method: 'POST'
      },
      removeCustomComponent: {
        url: `${prefix}/tenant/admin/remove-custom-component`,
        method: 'POST'
      },
      saveCustomComponent: {
        url: `${prefix}/tenant/admin/save-custom-component`,
        method: 'POST'
      },
      copyCustomComponent: {
        url: `${prefix}/tenant/admin/copy-custom-component`,
        method: 'POST'
      },
      customComponentDetail: {
        url: `${prefix}/tenant/admin/custom-component-detail`,
        method: 'GET'
      },
      removeArg: {
        url: `${prefix}/tenant/admin/remove-arg`,
        method: 'POST'
      },
      role: {
        create: {
          url: `${prefix}/tenant/admin/role/create`,
          method: 'POST'
        },
        list: {
          url: `${prefix}/tenant/admin/role/list`,
          method: 'GET'
        },
        save: {
          url: `${prefix}/tenant/admin/role/save`,
          method: 'POST'
        },
        setStatus: {
          url: `${prefix}/tenant/admin/role/set-status`,
          method: 'POST'
        },
        remove: {
          url: `${prefix}/tenant/admin/role/remove`,
          method: 'POST'
        },
        permissionList: {
          url: `${prefix}/tenant/admin/role/permission-list`,
          method: 'GET'
        },
        permissionSave: {
          url: `${prefix}/tenant/admin/role/save-permission`,
          method: 'POST'
        }
      },
      permission: {
        list: {
          url: `${prefix}/tenant/admin/permission/list`,
          method: 'GET'
        },
        save: {
          url: `${prefix}/tenant/admin/permission/save`,
          method: 'POST'
        }
      }
    },
    tenant: {
      parseJoinToken: {
        url: `${prefix}/tenant/parse-join-token`,
        method: 'POST'
      },
      join: {
        url: `${prefix}/tenant/join`,
        method: 'POST'
      },
      availableList: {
        url: `${prefix}/tenant/available-list`,
        method: 'GET'
      },
      switchDefaultTenant: {
        url: `${prefix}/tenant/switch-default-tenant`,
        method: 'POST'
      },
      getUserInfo: {
        url: `${prefix}/tenant/getUserInfo`,
        method: 'GET'
      },
      companyDetail: {
        url: `${prefix}/tenant/company-detail`,
        method: 'GET'
      },
      companySave: {
        url: `${prefix}/tenant/company-save`,
        method: 'POST'
      },
      orgList: {
        url: `${prefix}/tenant/org-list`,
        method: 'GET'
      },
      orgCreate: {
        url: `${prefix}/tenant/org-create`,
        method: 'POST'
      },
      orgSave: {
        url: `${prefix}/tenant/org-save`,
        method: 'POST'
      },
      orgRemove: {
        url: `${prefix}/tenant/org-remove`,
        method: 'POST'
      },
      userList: {
        url: `${prefix}/tenant/user-list`,
        method: 'GET'
      },
      userCreate: {
        url: `${prefix}/tenant/user-create`,
        method: 'POST'
      },
      userSetStatus: {
        url: `${prefix}/tenant/user-set-status`,
        method: 'POST'
      },
      userSave: {
        url: `${prefix}/tenant/user-save`,
        method: 'POST'
      },
      userRemove: {
        url: `${prefix}/tenant/user-remove`,
        method: 'POST'
      },
      userInviteToken: {
        url: `${prefix}/tenant/user-invite-token`,
        method: 'GET'
      },
      userInviteMessage: {
        url: `${prefix}/tenant/send-invite-message`,
        method: 'POST'
      },
      customComponentDetail: {
        url: `${prefix}/tenant/custom-component-detail`,
        method: 'GET'
      },
      role: {
        create: {
          url: `${prefix}/tenant/role/create`,
          method: 'POST'
        },
        list: {
          url: `${prefix}/tenant/role/list`,
          method: 'GET'
        },
        save: {
          url: `${prefix}/tenant/role/save`,
          method: 'POST'
        },
        setStatus: {
          url: `${prefix}/tenant/role/set-status`,
          method: 'POST'
        },
        remove: {
          url: `${prefix}/tenant/role/remove`,
          method: 'POST'
        },
        permissionList: {
          url: `${prefix}/tenant/role/permission-list`,
          method: 'GET'
        },
        permissionSave: {
          url: `${prefix}/tenant/role/save-permission`,
          method: 'POST'
        }
      },
      permission: {
        list: {
          url: `${prefix}/tenant/permission/list`,
          method: 'GET'
        }
      }
    },
    intlAdmin: {
      langType: {
        list: {
          loader: () => {
            return {
              totalCount: 0,
              pageData: []
            };
          },
          url: `${prefix}/intl-admin/lang-type/list`,
          method: 'GET'
        },
        create: {
          url: `${prefix}/intl-admin/lang-type/create`,
          method: 'POST'
        },
        save: {
          url: `${prefix}/intl-admin/lang-type/save`,
          method: 'POST'
        },
        remove: {
          url: `${prefix}/intl-admin/lang-type/remove`,
          method: 'POST'
        },
        setStatus: {
          url: `${prefix}/intl-admin/lang-type/set-status`,
          method: 'POST'
        }
      },
      langLib: {
        list: {
          loader: () => {
            return {
              totalCount: 0,
              pageData: []
            };
          },
          url: `${prefix}/intl-admin/lang-lib/list`,
          method: 'GET'
        },
        create: {
          url: `${prefix}/intl-admin/lang-lib/add-package`,
          method: 'POST'
        },
        save: {
          url: `${prefix}/intl-admin/lang-lib/save`,
          method: 'POST'
        },
        setStatus: {
          url: `${prefix}/intl-admin/lang-lib/set-status`,
          method: 'POST'
        },
        remove: {
          url: `${prefix}/intl-admin/lang-lib/remove`,
          method: 'POST'
        }
      }
    },
    messageManger: {
      records: {
        list: {
          url: `${prefix}/message/records`,
          method: 'GET'
        },
        detail: {
          url: `${prefix}/message/records/:id`,
          method: 'GET'
        }
      },
      templates: {
        list: {
          url: `${prefix}/message/templates`,
          method: 'GET'
        },
        detail: {
          url: `${prefix}/message/templates/:id`,
          method: 'GET'
        },
        send: {
          url: `${prefix}/message/templates/send`,
          method: 'POST'
        }
      },
      statistics: {
        getOverview: {
          url: `${prefix}/message/statistics`,
          method: 'GET'
        },
        sse: {
          url: `${prefix}/message/statistics/sse`,
          method: 'GET'
        }
      }
    },
    mq: {
      message: {
        publish: {
          url: `${prefix}/mq/message/publish`,
          method: 'POST'
        },
        list: {
          url: `${prefix}/mq/message/list`,
          method: 'GET'
        }
      },
      deadLetter: {
        list: {
          url: `${prefix}/mq/dlq/list`,
          method: 'GET'
        },
        replay: {
          url: `${prefix}/mq/dlq/replay`,
          method: 'POST'
        }
      },
      trace: {
        list: {
          url: `${prefix}/mq/trace/list`,
          method: 'GET'
        },
        detail: {
          url: `${prefix}/mq/trace/detail`,
          method: 'GET'
        }
      },
      dashboard: {
        getData: {
          url: `${prefix}/mq/dashboard`,
          method: 'GET'
        },
        sse: {
          url: `${prefix}/mq/dashboard/sse`,
          method: 'GET'
        }
      },
      queue: {
        depth: {
          url: `${prefix}/mq/queue/depth`,
          method: 'GET'
        },
        cleanup: {
          url: `${prefix}/mq/queue/cleanup`,
          method: 'POST'
        }
      }
    }
  };
};

export default getApis;
