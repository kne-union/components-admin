import ChildrenRouter from '@kne/app-children-router';

const TenantAdmin = ({ baseUrl, ...props }) => {
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

export default TenantAdmin;
