import { createWithRemoteLoader } from '@kne/remote-loader';
import MfaSettingPanel from '@components/Tenant/MfaSetting';

const MfaSetting = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, tenant }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  return <MfaSettingPanel apis={apis.tenantAdmin.mfaSetting} tenantId={tenant.id} />;
});

export default MfaSetting;
