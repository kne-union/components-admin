import { createWithRemoteLoader } from '@kne/remote-loader';
import { useSearchParams, useNavigate } from 'react-router-dom';
import merge from 'lodash/merge';
import { App } from 'antd';
import md5 from 'md5';
import { useProps } from './context';
import { setToken } from '@kne/token-storage';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const DoLoginInner = createWithRemoteLoader({
  modules: ['component-core:Global@usePreset']
})(({ remoteModules, children }) => {
  const [usePreset] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis: presetApis, ajax } = usePreset();
  const { apis, targetUrl, storeKeys, domain, afterLogin } = useProps();
  const account = Object.assign({}, presetApis.account, apis);
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referer = searchParams.get('referer');
  return children({
    login: async ({ isTenant, ...formData }) => {
      const { data: resData } = await ajax(
        merge({}, account.login, {
          data: {
            ...formData,
            password: md5(formData.password)
          }
        })
      );

      if (resData.code !== 0) {
        return;
      }

      if (resData.data.status === 10) {
        message.warning(formatMessage({ id: 'AccountNotInitialized' }));
        navigate(`/account/modify/${formData.email || formData.phone}${referer ? `?referer=${referer}` : ''}`);
        return;
      }

      if (resData.data.status === 11) {
        message.warning(formatMessage({ id: 'AccountDisabled' }));
        return;
      }

      if (resData.data.status === 12) {
        message.warning(formatMessage({ id: 'AccountClosed' }));
        return;
      }

      let refererHref = targetUrl || '/';

      if (referer) {
        const _referer = decodeURIComponent(referer);
        let obj = new URL(/http(s)?:/.test(_referer) ? _referer : window.location.origin + _referer);
        obj.searchParams.delete('referer');
        Object.values(resData.data).forEach(key => key && obj.searchParams.delete(key.toUpperCase()));
        refererHref = obj.pathname + obj.search;
      }

      Object.keys(storeKeys).forEach(key => {
        resData.data[key] && setToken(storeKeys[key], resData.data[key], domain);
      });

      if (afterLogin) {
        const data = await afterLogin({ referer: refererHref });
        if (data === false) {
          return;
        }
      }
      message.success(formatMessage({ id: 'LoginSuccess' }));
      navigate(refererHref);
    }
  });
});

export default withLocale(DoLoginInner);
