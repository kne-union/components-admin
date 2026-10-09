import { Button } from 'antd';
import { useIntl } from '@kne/react-intl';
import withOidcClient from './withOidcClient';
import withLocale from './withLocale';

const OidcLogout = withOidcClient(
  withLocale(({ client, returnTo, children, ...props }) => {
    const { formatMessage } = useIntl();
    return (
      <Button {...props} onClick={() => client.logout({ returnTo })}>
        {children ?? formatMessage({ id: 'OidcLogout' })}
      </Button>
    );
  })
);

export default OidcLogout;
