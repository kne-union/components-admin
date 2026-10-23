import { Alert } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';

const ManagedTenantAlert = withLocale(({ style }) => {
  const { formatMessage } = useIntl();
  return <Alert type="info" showIcon message={formatMessage({ id: 'ManagedTenantTips' })} style={Object.assign({ marginBottom: 8 }, style)} />;
});

export default ManagedTenantAlert;
