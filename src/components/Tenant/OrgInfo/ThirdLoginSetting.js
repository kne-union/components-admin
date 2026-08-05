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

const getLinkedEnvArgs = envArgs => (envArgs || []).filter(item => item.key && item.key.startsWith('TARGET_LINKED_'));

const LinkFormInner = withLocale(
  createWithRemoteLoader({
    modules: ['components-core:FormInfo']
  })(({ remoteModules, envArgs, sourceOptions, usedTargetIds = [] }) => {
    const [FormInfo] = remoteModules;
    const { formatMessage } = useIntl();
    const { RadioGroup, Select } = FormInfo.fields;
    const availableTargets = getLinkedEnvArgs(envArgs).filter(item => !usedTargetIds.includes(item.key));

    return (
      <FormInfo
        column={1}
        list={[
          <RadioGroup
            key="source"
            name="source"
            label={formatMessage({ id: 'ThirdLoginConfigSource' })}
            rule="REQ"
            defaultValue={sourceOptions?.[0]?.value || 'wecom'}
            options={(sourceOptions || []).map(item => ({
              value: item.value,
              label: item.label
            }))}
          />,
          <Select
            key="targetId"
            name="targetId"
            label={formatMessage({ id: 'ThirdLoginConfigTargetId' })}
            rule="REQ"
            options={availableTargets.map(item => ({
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

  const handleCancel = async ({ source, targetId }, reload) => {
    const { data: resData } = await ajax(
      merge({}, apis.thirdLoginConfigCancel, {
        data: { source, targetId }
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
        const usedTargetIds = list.map(item => item.targetId).filter(Boolean);
        const availableTargets = getLinkedEnvArgs(envArgs).filter(item => !usedTargetIds.includes(item.key));

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
                    key={`${item.source}-${item.targetId}`}
                    actions={[
                      <Popconfirm
                        key="cancel"
                        title={formatMessage({ id: 'ThirdLoginConfigCancelConfirm' })}
                        onConfirm={() => handleCancel({ source: item.source, targetId: item.targetId }, reload)}>
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
            {availableTargets.length && sourceOptions.length ? (
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
                    children: <LinkFormInner envArgs={envArgs} sourceOptions={sourceOptions} usedTargetIds={usedTargetIds} />
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
