import { createWithRemoteLoader } from '@kne/remote-loader';

const orgFilterInterceptor = {
  input: value => {
    if (!value) {
      return value;
    }
    if (value.id != null) {
      return value;
    }
    if (value.value != null) {
      return { id: value.value, name: value.label };
    }
    return value;
  },
  output: selected => {
    if (!selected) {
      return selected;
    }
    const item = Array.isArray(selected) ? selected[0] : selected;
    if (!item) {
      return null;
    }
    return {
      label: item.name ?? item.label,
      value: item.id ?? item.value
    };
  }
};

const DepartmentTreeFilterItem = createWithRemoteLoader({
  modules: ['components-core:Filter@withFieldItem', 'components-core:Common@SuperSelectTreeField']
})(({ remoteModules, ...props }) => {
  const [withFieldItem, SuperSelectTreeField] = remoteModules;
  const Item = withFieldItem(SuperSelectTreeField);
  return (
    <Item
      {...props}
      single
      valueKey="id"
      labelKey="name"
      parentKey="parentId"
      interceptor={orgFilterInterceptor}
    />
  );
});

export default DepartmentTreeFilterItem;
