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
    }
  };
};

export default getApis;
