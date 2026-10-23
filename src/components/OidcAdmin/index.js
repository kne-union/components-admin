import AppChildrenRouter from '@kne/app-children-router';
import ClientManager from './ClientManager';
import ResourceServerManager from './ResourceServerManager';
import KeyManager from './KeyManager';
import SessionManager from './SessionManager';
import AppManager from './AppManager';
import TenantApps from './TenantApps';

const OidcAdmin = ({ baseUrl, children, ...props }) => {
  return (
    <AppChildrenRouter
      list={[
        {
          index: true,
          element: <ClientManager {...props} baseUrl={baseUrl} />
        },
        {
          path: 'resource-servers',
          element: <ResourceServerManager {...props} baseUrl={baseUrl} />
        },
        {
          path: 'keys',
          element: <KeyManager {...props} baseUrl={baseUrl} />
        },
        {
          path: 'sessions',
          element: <SessionManager {...props} baseUrl={baseUrl} />
        },
        {
          path: 'apps',
          element: <AppManager {...props} baseUrl={baseUrl} />
        }
      ]}
    >
      {children}
    </AppChildrenRouter>
  );
};

export default OidcAdmin;

export { ClientManager, ResourceServerManager, KeyManager, SessionManager, AppManager, TenantApps };
export { toggleAppCodes } from './TenantApps/utils';
export { toFormData as clientToFormData, toPayload as clientToPayload } from './ClientManager/utils';
