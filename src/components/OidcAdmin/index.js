import AppChildrenRouter from '@kne/app-children-router';
import ClientManager from './ClientManager';
import ResourceServerManager from './ResourceServerManager';
import KeyManager from './KeyManager';
import SessionManager from './SessionManager';

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
        }
      ]}>
      {children}
    </AppChildrenRouter>
  );
};

export default OidcAdmin;

export { ClientManager, ResourceServerManager, KeyManager, SessionManager };
export { toFormData as clientToFormData, toPayload as clientToPayload } from './ClientManager/utils';
