import { createWithRemoteLoader } from '@kne/remote-loader';
import MailSettingPanel from '@components/Tenant/MailSetting';

const MailSetting = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, tenant }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  return <MailSettingPanel apis={apis.tenantAdmin.mailSetting} tenantId={tenant.id} />;
});

export default MailSetting;
