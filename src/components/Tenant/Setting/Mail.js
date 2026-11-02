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
  // 兼容不分子模块的 setting:mail-setting:view / edit
  const smtpEdit = usePermissionsPass({ request: ['setting:mail-setting:smtp:edit', 'setting:mail-setting:edit'] });
  const smtpView = usePermissionsPass({ request: ['setting:mail-setting:smtp:view', 'setting:mail-setting:view'] }) || smtpEdit;
  const templateEdit = usePermissionsPass({ request: ['setting:mail-setting:template:edit', 'setting:mail-setting:edit'] });
  const templateView = usePermissionsPass({ request: ['setting:mail-setting:template:view', 'setting:mail-setting:view'] }) || templateEdit;

  const pageProps = Object.assign({}, originPageProps, {
    menu,
    title: formatMessage({ id: 'MailSettingPage' }),
    children:
      smtpView || templateView ? (
        <MailSetting
          apis={apis.tenant.mailSetting}
          permissions={{ smtp: { view: smtpView, edit: smtpEdit }, template: { view: templateView, edit: templateEdit } }}
        />
      ) : (
        <Permissions request={['setting:mail-setting:view']} type="error" />
      )
  });

  if (typeof children === 'function') {
    return children(pageProps);
  }
  return <Page {...pageProps} />;
});

export default withLocale(MailInner);
