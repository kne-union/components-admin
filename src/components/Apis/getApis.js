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
        }
      },
      permission: {
        list: {
          url: `${prefix}/tenant/admin/permission/list`,
          method: 'GET'
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
    }
  };
};

export default getApis;
