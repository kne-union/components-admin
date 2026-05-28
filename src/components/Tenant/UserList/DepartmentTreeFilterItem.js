import { createWithRemoteLoader } from '@kne/remote-loader';

const DepartmentTreeFilterItem = createWithRemoteLoader({
  modules: ['components-core:Filter@withFieldItem', 'components-core:Filter@singleSelectInterceptor', 'components-core:Common@SuperSelectTreeField']
})(({ remoteModules, ...props }) => {
  const [withFieldItem, singleSelectInterceptor, SuperSelectTreeField] = remoteModules;
  const Item = withFieldItem(SuperSelectTreeField);
  return (
    <Item
      {...props}
      single
      valueKey="id"
      labelKey="name"
      parentKey="parentId"
      interceptor={singleSelectInterceptor}
    />
  );
});

export default DepartmentTreeFilterItem;
