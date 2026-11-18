/**
 * TablePage/Fetch 走全局 ajax，usePreset().ajax 走 PureGlobal preset；
 * 两边都要能拦 /app-ops/link/*，否则「访问记录」会打到真实网络。
 */
import createPlatformLinkMock from './platform-link';

const delay = (result, ms = 200) => new Promise(resolve => setTimeout(() => resolve(result), ms));

export const createPlatformLinkAjax = () => {
  const platformLinkMock = createPlatformLinkMock({ delay });

  const handle = async props => {
    if (props?.loader || !props?.url) {
      return null;
    }
    const linkData = await platformLinkMock.handleAjax(props);
    if (!linkData) {
      return null;
    }
    if (linkData.__biz) {
      return { data: { code: linkData.code, msg: linkData.msg, data: linkData.data } };
    }
    return { data: { code: 0, data: linkData } };
  };

  return handle;
};

export const wrapAjaxWithPlatformLink = baseAjax => {
  const handle = createPlatformLinkAjax();
  const ajax = async props => {
    const mocked = await handle(props);
    if (mocked) {
      return mocked;
    }
    return baseAjax(props);
  };
  // createAjax 会挂 postForm 等；透传以免上传类调用丢失
  Object.keys(baseAjax || {}).forEach(key => {
    if (typeof baseAjax[key] === 'function') {
      ajax[key] = baseAjax[key].bind(baseAjax);
    }
  });
  return ajax;
};

export default wrapAjaxWithPlatformLink;
