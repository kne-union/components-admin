import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import MfaSetting from '../MfaSetting';

const MfaInner = createWithRemoteLoader({
  modules: [
    'components-core:Layout@Page',
    'components-core:Global@usePreset',
    'components-core:Permissions',
    'components-core:Permissions@usePermissionsPass'
  ]
})(({ remoteModules, menu, pageProps: originPageProps, children }) => {
  const [Page, usePreset, Permissions, usePermissionsPass] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis } = usePreset();
  const hasEdit = usePermissionsPass({ request: ['setting:mfa-setting:edit'] });
  const hasView = usePermissionsPass({ request: ['setting:mfa-setting:view'] }) || hasEdit;

  const pageProps = Object.assign({}, originPageProps, {
    menu,
    title: formatMessage({ id: 'MfaSettingPage' }),
    children: hasView ? (
      <MfaSetting apis={apis.tenant.mfaSetting} hasEdit={hasEdit} />
    ) : (
      <Permissions request={['setting:mfa-setting:view']} type="error" />
    )
  });

  if (typeof children === 'function') {
    return children(pageProps);
  }
  return <Page {...pageProps} />;
});

export default withLocale(MfaInner);
