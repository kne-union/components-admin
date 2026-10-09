import { createWithRemoteLoader } from '@kne/remote-loader';

const withOidcClient = WrappedComponent =>
  createWithRemoteLoader({
    modules: ['components-core:Global@usePreset']
  })(({ remoteModules, client, ...props }) => {
    const [usePreset] = remoteModules;
    const preset = usePreset();
    const oidcClient = client || preset.oidc;
    if (!oidcClient) {
      throw new Error('Oidc: 未找到 OIDC client，请通过 client 属性传入，或在 preset 中设置 oidc');
    }
    return <WrappedComponent {...props} client={oidcClient} />;
  });

export default withOidcClient;
