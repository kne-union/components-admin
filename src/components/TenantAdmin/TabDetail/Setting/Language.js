import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState, useMemo } from 'react';
import { App, Button, Flex, List, Tag, Empty } from 'antd';
import { FormOutlined, CheckCircleFilled, CheckCircleOutlined } from '@ant-design/icons';
import Fetch from '@kne/react-fetch';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';
import LanguageCheckList, { orderLanguageOptions } from './LanguageCheckList';

export const BUILTIN_LANGUAGE_OPTIONS = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
];

export const normalizeLanguageOptions = (raw, { showBuiltinLanguageOptions = false } = {}) => {
  const list = Array.isArray(raw) ? raw : raw?.pageData || [];
  const fromApi = list
    .filter(item => {
      if (!item) return false;
      if (item.status && item.status !== 'open') return false;
      return !!(item.code || item.value);
    })
    .map(item => ({
      label: item.name || item.label || item.code || item.value,
      value: item.code || item.value
    }));

  const merged = [];
  const seen = new Set();
  const pushUnique = option => {
    if (!option?.value || seen.has(option.value)) return;
    seen.add(option.value);
    merged.push(option);
  };

  fromApi.forEach(pushUnique);
  if (showBuiltinLanguageOptions) {
    BUILTIN_LANGUAGE_OPTIONS.forEach(pushUnique);
  }
  return merged;
};

const LanguageContent = ({ languageOptions, tenant, reload, FormInfo, InfoPage, usePreset, formatMessage }) => {
  const { Form, SubmitButton, CancelButton } = FormInfo;
  const [isEdit, setIsEdit] = useState(false);
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();

  const data = {
    languages: {
      selected: tenant.supportLanguage || [],
      default: tenant.defaultLanguage || ''
    }
  };

  if (!languageOptions.length) {
    return <Empty description={formatMessage({ id: 'NoLanguageOptions' })} />;
  }

  if (isEdit) {
    return (
      <Form
        type="default"
        data={data}
        rules={{
          LANGUAGE_REQ: value => ({
            result: !!(value?.selected && value.selected.length > 0),
            errMsg: formatMessage({ id: 'SystemLanguage' })
          })
        }}
        onSubmit={async formData => {
          const { data: resData } = await ajax(
            Object.assign({}, apis.tenantAdmin.saveLanguages, {
              data: {
                tenantId: tenant.id,
                supportLanguage: formData.languages.selected,
                defaultLanguage: formData.languages.default || formData.languages.selected[0]
              }
            })
          );
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'SaveSuccess' }));
          setIsEdit(false);
          reload();
        }}
      >
        <FormInfo
          title={formatMessage({ id: 'LanguageSetting' })}
          list={[
            <LanguageCheckList
              name="languages"
              label={formatMessage({ id: 'SystemLanguage' })}
              rule="LANGUAGE_REQ"
              options={languageOptions}
              block
            />
          ]}
        />
        <Flex justify="center" gap={12}>
          <SubmitButton>{formatMessage({ id: 'Save' })}</SubmitButton>
          <CancelButton
            onClick={() => {
              setIsEdit(false);
            }}
          >
            {formatMessage({ id: 'Cancel' })}
          </CancelButton>
        </Flex>
      </Form>
    );
  }

  const languages = data.languages?.selected || [];
  const defaultLanguage = data.languages?.default || '';

  return (
    <InfoPage>
      <InfoPage.Part
        title={formatMessage({ id: 'LanguageSetting' })}
        extra={
          <Button
            type="link"
            icon={<FormOutlined />}
            onClick={() => {
              setIsEdit(true);
            }}
          >
            {formatMessage({ id: 'Edit' })}
          </Button>
        }
      >
        <InfoPage.Part title={formatMessage({ id: 'SystemLanguage' })}>
          <List
            bordered
            dataSource={orderLanguageOptions(languageOptions, languages)}
            renderItem={option => {
              const isSelected = languages.includes(option.value);
              const isDefault = defaultLanguage === option.value;
              return (
                <List.Item style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{option.label}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isDefault && (
                      <Tag color="blue" style={{ margin: 0 }}>
                        {formatMessage({ id: 'DefaultTag' })}
                      </Tag>
                    )}
                    {isSelected ? (
                      <CheckCircleFilled style={{ color: '#1677ff', fontSize: 18, flexShrink: 0 }} />
                    ) : (
                      <CheckCircleOutlined style={{ color: '#d9d9d9', fontSize: 18, flexShrink: 0 }} />
                    )}
                  </span>
                </List.Item>
              );
            }}
          />
        </InfoPage.Part>
      </InfoPage.Part>
    </InfoPage>
  );
};

const Language = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:FormInfo', 'components-core:InfoPage']
})(
  withLocale(({ remoteModules, tenant, reload, languageOptionsApi, showBuiltinLanguageOptions = false }) => {
    const [usePreset, FormInfo, InfoPage] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();

    const optionsApi = useMemo(() => {
      return languageOptionsApi || apis?.intlAdmin?.langType?.list || null;
    }, [languageOptionsApi, apis?.intlAdmin?.langType?.list]);

    const contentProps = { tenant, reload, FormInfo, InfoPage, usePreset, formatMessage };

    if (!optionsApi) {
      const languageOptions = normalizeLanguageOptions([], { showBuiltinLanguageOptions });
      return <LanguageContent {...contentProps} languageOptions={languageOptions} />;
    }

    const isGet = !optionsApi.method || String(optionsApi.method).toUpperCase() === 'GET';
    const requestParams = { currentPage: 1, perPage: 100 };

    return (
      <Fetch
        {...Object.assign(
          {},
          optionsApi,
          isGet
            ? { params: Object.assign({}, requestParams, optionsApi.params) }
            : { data: Object.assign({}, requestParams, optionsApi.data) }
        )}
        render={({ data }) => {
          const languageOptions = normalizeLanguageOptions(data, { showBuiltinLanguageOptions });
          return <LanguageContent {...contentProps} languageOptions={languageOptions} />;
        }}
      />
    );
  })
);

export default Language;
