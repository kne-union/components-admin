import * as dd from 'dingtalk-jsapi';

const getErrorMessage = err => {
  if (!err) {
    return '钉钉授权失败';
  }
  if (typeof err === 'string') {
    return err;
  }
  return err.errorMessage || err.message || err.errorCode || '钉钉授权失败';
};

const dingTalkCode = ({ corpId, clientId }) => {
  if (!corpId || !clientId) {
    return Promise.reject(new Error('corpId and clientId are required'));
  }

  if (!dd?.env || dd.env.platform === 'notInDingTalk' || typeof dd.requestAuthCode !== 'function') {
    return Promise.reject(new Error('当前环境不支持钉钉登录，请在钉钉客户端内打开'));
  }

  return new Promise((resolve, reject) => {
    const onFail = err => {
      reject(new Error(getErrorMessage(err)));
    };
    if (!corpId || !clientId) {
      reject(new Error('缺少必要参数'));
      return;
    }
    try {
      const ret = dd.requestAuthCode({
        corpId,
        clientId,
        onSuccess: result => {
          resolve(result);
        },
        onFail
      });
      // jsapi 会额外返回 Promise，未 catch 会在非钉钉环境产生 Uncaught (in promise)
      if (ret && typeof ret.then === 'function') {
        ret.then(resolve, onFail);
      }
    } catch (err) {
      onFail(err);
    }
  });
};

export default dingTalkCode;
