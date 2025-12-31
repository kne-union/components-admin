import ChildrenRouter from '@kne/app-children-router';
import withLocale from './withLocale';

const TenantAdminInner = ({ baseUrl, ...props }) => {
  return (
    <ChildrenRouter
      {...props}
      baseUrl={`${baseUrl}/tenant`}
      list={[
        {
          index: true,
          loader: () => import('./List')
        },
        {
          path: 'detail',
          loader: () => import('./TabDetail')
        }
      ]}
    />
  );
};

export default withLocale(TenantAdminInner);
