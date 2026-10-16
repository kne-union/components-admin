import { createWithRemoteLoader } from '@kne/remote-loader';
import { useFetch } from '@kne/react-fetch';
import { Select } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { ContactsProvider, useGetContacts, ContactSelect, ContactInput } from './contact';

export const useAccountList = apis => {
  const { data, reload } = useFetch(Object.assign({}, apis.mailGateway.account.list, { params: { perPage: 100 } }));
  return { list: data?.pageData || [], reload };
};

export const AccountSelect = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, placeholder, onlyEnabled, ...props }) => {
    const [usePreset] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const { list } = useAccountList(apis);
    return (
      <Select
        allowClear
        showSearch
        optionFilterProp="label"
        placeholder={placeholder || formatMessage({ id: 'SelectAccount' })}
        {...props}
        options={list.map(item => ({
          label: `${item.name} <${item.address}>`,
          value: item.id,
          disabled: onlyEnabled && item.status !== 'enabled'
        }))}
      />
    );
  })
);

export const LabelSelect = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, accountId, placeholder, ...props }) => {
    const [usePreset] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const { data } = useFetch(Object.assign({}, apis.mailGateway.label.list, { params: { accountId } }));
    return (
      <Select
        allowClear
        mode="multiple"
        optionFilterProp="label"
        placeholder={placeholder || formatMessage({ id: 'SelectLabel' })}
        {...props}
        options={(data || []).map(item => ({ label: item.name, value: item.id }))}
      />
    );
  })
);

export const useTemplateList = (apis, { categoryId, onlyEnabled = true } = {}) => {
  const { data, reload } = useFetch(
    Object.assign({}, apis.mailGateway.template.list, {
      params: { perPage: 500, filter: Object.assign({}, onlyEnabled ? { status: 'enabled' } : {}, categoryId ? { categoryId } : {}) }
    })
  );
  return { list: data?.pageData || [], reload };
};

export const TemplateSelect = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, placeholder, categoryId, onlyEnabled = true, value, onChange, ...props }) => {
    const [FormInfo, usePreset] = remoteModules;
    const SuperSelect = FormInfo.fields.SuperSelect.Field || FormInfo.fields.SuperSelect;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const baseFilter = Object.assign({}, onlyEnabled ? { status: 'enabled' } : {}, categoryId ? { categoryId } : {});
    // 表单层用 interceptor=object-output-value 取 id；此处须保留 {value,label} 才能回显文案
    const normalizeValue = next => {
      if (next == null || next === '') {
        return undefined;
      }
      if (typeof next === 'object') {
        const id = next.value ?? next.id;
        if (id == null || id === '') {
          return undefined;
        }
        return Object.assign({}, next, {
          value: id,
          label: next.label ?? next.name ?? String(id)
        });
      }
      return { value: next, label: String(next) };
    };
    return (
      <SuperSelect
        single
        allowClear
        isPopup
        placeholder={placeholder || formatMessage({ id: 'SelectTemplate' })}
        pagination={{ paramsType: 'params' }}
        getSearchProps={({ searchText }) => ({
          filter: Object.assign({}, baseFilter, searchText ? { keyword: searchText } : null)
        })}
        api={Object.assign({}, apis.mailGateway.template.list, {
          params: { filter: baseFilter },
          transformData: data =>
            Object.assign({}, data, {
              pageData: (data.pageData || []).map(item =>
                Object.assign({}, item, {
                  value: item.id,
                  label: item.category?.name ? `${item.category.name} / ${item.name}` : item.name,
                  disabled: onlyEnabled ? false : item.status !== 'enabled'
                })
              )
            })
        })}
        value={normalizeValue(value)}
        onChange={next => onChange && onChange(next == null || next === '' ? undefined : normalizeValue(next))}
        {...props}
      />
    );
  })
);

export const useTemplateCategoryList = apis => {
  const { data, reload } = useFetch(Object.assign({}, apis.mailGateway.templateCategory.list, { params: { perPage: 500 } }));
  return { list: data?.pageData || [], uncategorizedCount: data?.uncategorizedCount || 0, reload };
};

export const TemplateCategorySelect = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, placeholder, ...props }) => {
    const [usePreset] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const { list } = useTemplateCategoryList(apis);
    return (
      <Select
        allowClear
        showSearch
        optionFilterProp="label"
        placeholder={placeholder || formatMessage({ id: 'SelectTemplateCategory' })}
        {...props}
        options={list.map(item => ({ label: item.name, value: item.id }))}
      />
    );
  })
);

export const createField = WrappedComponent =>
  createWithRemoteLoader({
    modules: ['components-core:FormInfo']
  })(({ remoteModules, ...props }) => {
    const [FormInfo] = remoteModules;
    const render = FormInfo.hooks.useOnChange(props);
    return render(WrappedComponent);
  });

export { ContactsProvider, useGetContacts, ContactSelect, ContactInput };

export const ContactSelectField = createField(ContactSelect);
export const ContactInputField = createField(ContactInput);
export const AccountSelectField = createField(AccountSelect);
export const LabelSelectField = createField(LabelSelect);
export const TemplateSelectField = createField(TemplateSelect);
export const TemplateCategorySelectField = createField(TemplateCategorySelect);
