import { useEffect, useState, useRef } from 'react';
import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { INTL_NAMESPACE_TYPE } from '../constants';
import { resolveNamespaceCode, toNamespaceFieldValue } from '../syncNamespacesToGroup';

const normalizeLocales = locale => {
  if (locale == null || locale === '') {
    return [];
  }
  const list = Array.isArray(locale) ? locale : [locale];
  return list
    .map(item => {
      if (item && typeof item === 'object') {
        const value = item.value ?? item.code ?? item.id;
        if (!value) {
          return null;
        }
        return {
          value,
          label: item.label ?? item.name ?? value
        };
      }
      return { value: item, label: item };
    })
    .filter(Boolean);
};

export const getTargetFieldName = localeCode => `target__${localeCode}`;

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset', 'components-admin:GroupSelect']
})(
  withLocale(({ remoteModules, action, existingLocales = [], defaultNamespace, GroupSelect: GroupSelectProp }) => {
    const [FormInfo, usePreset, GroupSelectRemote] = remoteModules;
    const GroupSelect = GroupSelectProp || GroupSelectRemote;
    const { useFormContext } = FormInfo;
    const { formatMessage } = useIntl();
    const { apis, ajax } = usePreset();
    const { Input, TextArea, SuperSelect, Switch } = FormInfo.fields;
    const { formData, openApi } = useFormContext();
    const isEdit = action === 'edit';
    const isAddLocale = action === 'addLocale';
    const lockNamespaceCode = isEdit || isAddLocale;
    const lockNamespace = lockNamespaceCode || !!defaultNamespace;
    const aiGenerate = !!formData.aiGenerate;
    const locales = normalizeLocales(formData.locale);
    const disabledLocaleSet = new Set(existingLocales || []);
    const [defaultLang, setDefaultLang] = useState(null);
    const sourceFetchKeyRef = useRef('');

    useEffect(() => {
      let cancelled = false;
      const loadDefaultLang = async () => {
        if (!apis?.intlAdmin?.langType?.list) {
          return;
        }
        try {
          const { data: resData } = await ajax(
            merge({}, apis.intlAdmin.langType.list, {
              params: {
                isDefault: true,
                perPage: 1,
                currentPage: 1
              }
            })
          );
          if (cancelled || resData?.code !== 0) {
            return;
          }
          const pageData = resData?.data?.pageData || [];
          setDefaultLang(pageData[0] || null);
        } catch (e) {
          // ignore
        }
      };
      loadDefaultLang();
      return () => {
        cancelled = true;
      };
    }, [ajax, apis?.intlAdmin?.langType?.list]);

    useEffect(() => {
      if (!defaultLang?.code || !openApi?.setFields) {
        return;
      }
      openApi.setFields([{ name: 'defaultLocale', value: defaultLang.code }]);
    }, [defaultLang?.code, openApi]);

    useEffect(() => {
      if (!aiGenerate || isEdit || !defaultLang?.code) {
        sourceFetchKeyRef.current = '';
        return;
      }
      const namespace = resolveNamespaceCode(formData.namespace);
      const code = String(formData.code || '').trim();
      if (!namespace || !code || !apis?.intlAdmin?.langLib?.list) {
        return;
      }
      const fetchKey = `${namespace}::${code}::${defaultLang.code}`;
      if (sourceFetchKeyRef.current === fetchKey) {
        return;
      }
      sourceFetchKeyRef.current = fetchKey;
      let cancelled = false;
      const loadSourceTarget = async () => {
        try {
          const { data: resData } = await ajax(
            merge({}, apis.intlAdmin.langLib.list, {
              params: {
                namespace,
                code,
                locale: defaultLang.code,
                perPage: 1,
                currentPage: 1
              }
            })
          );
          if (cancelled || resData?.code !== 0) {
            return;
          }
          const pageData = resData?.data?.pageData || [];
          const hit = pageData.find(
            item => item.locale === defaultLang.code && item.namespace === namespace && item.code === code
          );
          if (openApi?.setFields) {
            openApi.setFields([{ name: 'sourceTarget', value: hit?.target || '' }]);
          }
        } catch (e) {
          // ignore
        }
      };
      loadSourceTarget();
      return () => {
        cancelled = true;
      };
    }, [
      aiGenerate,
      isEdit,
      defaultLang?.code,
      formData.namespace,
      formData.code,
      ajax,
      apis?.intlAdmin?.langLib?.list,
      openApi
    ]);

    const targetFields = (() => {
      if (aiGenerate) {
        const localeLabel = defaultLang
          ? `${defaultLang.name || ''}${defaultLang.code ? ` / ${defaultLang.code}` : ''}`.trim()
          : formatMessage({ id: 'DefaultLanguage' });
        return [
          <Input key="defaultLocale" name="defaultLocale" display={false} />,
          <TextArea
            key="sourceTarget"
            name="sourceTarget"
            label={formatMessage({ id: 'SourceTarget' }, { locale: localeLabel })}
            rule="REQ LEN-1-2000"
            placeholder={formatMessage({ id: 'SourceTargetPlaceholder' }, { locale: localeLabel })}
          />
        ];
      }
      if (isEdit) {
        return [<TextArea name="target" label={formatMessage({ id: 'Target' })} rule="REQ LEN-1-2000" />];
      }
      return locales
        .filter(({ value }) => !disabledLocaleSet.has(value))
        .map(({ value, label }) => (
          <TextArea
            key={value}
            name={getTargetFieldName(value)}
            label={formatMessage({ id: 'TargetForLocale' }, { locale: label || value })}
            rule="REQ LEN-1-2000"
          />
        ));
    })();

    const namespaceDefault = toNamespaceFieldValue(defaultNamespace || 'global');

    return (
      <FormInfo
        column={1}
        list={[
          <GroupSelect
            name="namespace"
            label={formatMessage({ id: 'Namespace' })}
            rule="REQ"
            single
            type={INTL_NAMESPACE_TYPE}
            groupName={formatMessage({ id: 'Namespace' })}
            showParent={false}
            valueKey="code"
            labelKey="name"
            defaultValue={namespaceDefault}
            disabled={lockNamespace}
            interceptor={{
              input: value => toNamespaceFieldValue(value),
              output: value => resolveNamespaceCode(value)
            }}
          />,
          <Input name="code" label={formatMessage({ id: 'Code' })} rule="REQ LEN-1-100" disabled={lockNamespaceCode} />,
          <SuperSelect
            name="locale"
            label={formatMessage({ id: 'Locale' })}
            rule="REQ"
            single={isEdit}
            isPopup
            disabled={isEdit}
            valueKey="id"
            labelKey="name"
            interceptor={isEdit ? 'object-output-value' : 'array-output-value'}
            api={Object.assign({}, apis.intlAdmin.langType.list, {
              transformData: data => ({
                pageData: (data.pageData || []).map(item => ({
                  id: item.code,
                  name: item.name,
                  value: item.code,
                  label: item.name,
                  disabled: disabledLocaleSet.has(item.code)
                }))
              })
            })}
          />,
          <Switch name="aiGenerate" label={formatMessage({ id: 'AiGenerate' })} display={!isEdit} />,
          ...targetFields
        ]}
      />
    );
  })
);

export default FormInner;
export { normalizeLocales };
