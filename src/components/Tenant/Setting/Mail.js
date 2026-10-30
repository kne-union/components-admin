import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import MailSetting from '../MailSetting';

const MailInner = createWithRemoteLoader({
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
  const hasEdit = usePermissionsPass({ request: ['setting:mail-setting:edit'] });

  const pageProps = Object.assign({}, originPageProps, {
    menu,
    title: formatMessage({ id: 'MailSettingPage' }),
    children: (
      <Permissions request={['setting:mail-setting:view']} type="error">
        <MailSetting apis={apis.tenant.mailSetting} hasEdit={hasEdit} />
      </Permissions>
    )
  });

  if (typeof children === 'function') {
    return children(pageProps);
  }
  return <Page {...pageProps} />;
});

export default withLocale(MailInner);
