import { createWithRemoteLoader } from '@kne/remote-loader';
import { useEffect, useState } from 'react';

// 没有 OIDC client（业务未接入 createOidcClient）时不请求配置：拿到配置也无法完成 SSO 回调
const SsoConfig = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, sso, children }) => {
  const [usePreset] = remoteModules;
  const { ajax, apis, oidc } = usePreset();
  const client = (sso && sso.client) || oidc;
  const configApi = apis?.oidc?.config;
  const disabled = sso === false || !client || !configApi;
  const [state, setState] = useState({ loading: !disabled, config: null });

  useEffect(() => {
    if (disabled) {
      return;
    }
    let cancelled = false;
    ajax(Object.assign({}, configApi, { ignoreState: true }))
      .then(({ data: resData }) => (resData?.code === 0 ? resData.data : null))
      .catch(() => null)
      .then(config => {
        if (!cancelled) {
          setState({ loading: false, config });
        }
      });
    return () => {
      cancelled = true;
    };
    // 只在挂载时探测一次；ajax / apis 引用变化不应重复请求
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  const mode = disabled ? null : state.config?.mode || null;
  return children({
    loading: !disabled && state.loading,
    enabled: !!mode,
    mode,
    client
  });
});

export default SsoConfig;
