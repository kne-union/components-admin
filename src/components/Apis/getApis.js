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
        method: 'POST',
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
    }
  };
};

export default getApis;
