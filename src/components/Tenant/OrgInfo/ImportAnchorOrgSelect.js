import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo } from 'react';
import merge from 'lodash/merge';
import style from './style.module.scss';

const toSelectValue = (orgId, data) => {
  if (orgId == null || orgId === '') {
    return null;
  }
  const org = (data || []).find(item => String(item.id) === String(orgId));
  if (org) {
    return { id: org.id, name: org.name };
  }
  return { id: orgId };
};

const ImportAnchorOrgSelect = createWithRemoteLoader({
  modules: ['components-core:Common@SuperSelectTreeField']
})(({ remoteModules, data, orgListApi, value, onChange, placeholder }) => {
  const [SuperSelectTreeField] = remoteModules;

  const api = useMemo(() => {
    if (orgListApi?.url) {
      return merge({}, orgListApi);
    }
    return {
      loader: () =>
        Promise.resolve({
          pageData: Array.isArray(data) ? data : []
        })
    };
  }, [data, orgListApi]);

  const selectValue = useMemo(() => toSelectValue(value, data), [value, data]);

  return (
    <SuperSelectTreeField
      className={style.importAnchorSelect}
      single
      allowClear
      isPopup
      valueKey="id"
      labelKey="name"
      parentKey="parentId"
      placeholder={placeholder}
      api={api}
      value={selectValue}
      onChange={selected => {
        if (!selected) {
          onChange(undefined);
          return;
        }
        const item = Array.isArray(selected) ? selected[0] : selected;
        onChange(item?.id ?? item?.value ?? undefined);
      }}
    />
  );
});

export default ImportAnchorOrgSelect;
