import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Tag, Button, App, Alert, Popconfirm, List, Typography } from 'antd';
import { PlusOutlined, DisconnectOutlined } from '@ant-design/icons';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import Fetch from '@kne/react-fetch';
import merge from 'lodash/merge';
import { getSourceIcon, SOURCE_LABEL_MAP } from '../constants';

const getSourceLabel = (value, sourceOptions) => {
  const item = (sourceOptions || []).find(o => o.value === value);
  return item ? item.label : value;
};

const LinkFormInner = withLocale(
  createWithRemoteLoader({
    modules: ['components-core:FormInfo']
  })(({ remoteModules, envArgs, sourceOptions, usedSources = [] }) => {
    const [FormInfo] = remoteModules;
    const { formatMessage } = useIntl();
    const { RadioGroup, Select } = FormInfo.fields;
    const availableSources = (sourceOptions || []).filter(item => !usedSources.includes(item.value));

    return (
      <FormInfo
        column={1}
        list={[
          <RadioGroup
            key="source"
            name="source"
            label={formatMessage({ id: 'ThirdLoginConfigSource' })}
            rule="REQ"
            defaultValue={availableSources[0]?.value || 'wecom'}
            options={availableSources.map(item => ({
              value: item.value,
              label: item.label
            }))}
          />,
          <Select
            key="targetId"
            name="targetId"
            label={formatMessage({ id: 'ThirdLoginConfigTargetId' })}
            rule="REQ"
            options={(envArgs || [])
              .filter(item => item.key && item.key.startsWith('TARGET_LINKED_'))
              .map(item => ({
                value: item.key,
                label: item.name || item.key
              }))}
            placeholder={formatMessage({ id: 'OrgLinkTargetIdPlaceholder' })}
            description={formatMessage({ id: 'OrgLinkTargetIdDesc' })}
          />
        ]}
      />
    );
  })
);

const ThirdLoginSetting = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:FormInfo@useFormModal']
})(({ remoteModules, apis, envArgs, onSuccess }) => {
  const [usePreset, useFormModal] = remoteModules;
  const { ajax } = usePreset();
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  const formModal = useFormModal();

  const handleCancel = async (source, reload) => {
    const { data: resData } = await ajax(
      merge({}, apis.thirdLoginConfigCancel, {
        data: { source }
      })
    );
    if (resData.code !== 0) {
      return;
    }
    message.success(formatMessage({ id: 'ThirdLoginConfigCancelSuccess' }));
    reload();
    onSuccess && onSuccess();
  };

  return (
    <Fetch
      {...apis.thirdLoginConfig}
      render={({ data, reload }) => {
        const configData = data || {};
        const sourceOptions = configData.sourceOptions || [];
        const list = configData.list || [];
        const usedSources = list.map(item => item.source);

        return (
          <Flex vertical gap={16}>
            <Alert type="info" showIcon message={formatMessage({ id: 'ThirdLoginConfigHint' })} />
            {list.length ? (
              <List
                size="small"
                bordered
                dataSource={list}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        key="cancel"
                        title={formatMessage({ id: 'ThirdLoginConfigCancelConfirm' })}
                        onConfirm={() => handleCancel(item.source, reload)}>
                        <Button danger size="small" type="link" icon={<DisconnectOutlined />}>
                          {formatMessage({ id: 'ThirdLoginConfigCancel' })}
                        </Button>
                      </Popconfirm>
                    ]}>
                    <List.Item.Meta
                      avatar={getSourceIcon(item.source, { style: { width: 24, height: 24, maxWidth: 24, maxHeight: 24 } })}
                      title={
                        <Flex gap={8} align="center">
                          <Typography.Text>{SOURCE_LABEL_MAP[item.source] || getSourceLabel(item.source, sourceOptions)}</Typography.Text>
                          <Tag>{item.targetId}</Tag>
                        </Flex>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Typography.Text type="secondary">{formatMessage({ id: 'ThirdLoginConfigEmpty' })}</Typography.Text>
            )}
            {usedSources.length < sourceOptions.length ? (
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => {
                  formModal({
                    title: formatMessage({ id: 'ThirdLoginConfigAdd' }),
                    size: 'small',
                    formProps: {
                      onSubmit: async formData => {
                        const { data: resData } = await ajax(
                          merge({}, apis.thirdLoginConfigSave, {
                            data: Object.assign({}, formData)
                          })
                        );
                        if (resData.code !== 0) {
                          return false;
                        }
                        message.success(formatMessage({ id: 'ThirdLoginConfigSaveSuccess' }));
                        reload();
                        onSuccess && onSuccess();
                      }
                    },
                    children: <LinkFormInner envArgs={envArgs} sourceOptions={sourceOptions} usedSources={usedSources} />
                  });
                }}>
                {formatMessage({ id: 'ThirdLoginConfigAdd' })}
              </Button>
            ) : null}
          </Flex>
        );
      }}
    />
  );
});

export default withLocale(ThirdLoginSetting);
