import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Tag, Button, App, Descriptions, Popconfirm, Alert, Space, Tooltip } from 'antd';
import { LinkOutlined, DisconnectOutlined, CloudSyncOutlined, LoadingOutlined } from '@ant-design/icons';
import { useState } from 'react';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import Fetch from '@kne/react-fetch';
import merge from 'lodash/merge';

const SYNC_INTERVAL_OPTIONS = [
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每7天' },
  { value: 'monthly', label: '每个月' },
  { value: 'yearly', label: '每年' },
  { value: 'off', label: '关闭' }
];

const getSourceLabel = (value, sourceOptions) => {
  const item = (sourceOptions || []).find(o => o.value === value);
  return item ? item.label : value;
};

const getSyncIntervalLabel = value => {
  const item = SYNC_INTERVAL_OPTIONS.find(o => o.value === value);
  return item ? item.label : value;
};

const STATUS_MAP = {
  pending: { label: '待同步', color: 'default' },
  running: { label: '同步中', color: 'processing' },
  success: { label: '同步成功', color: 'success' },
  failed: { label: '同步失败', color: 'error' }
};

const LinkFormInner = withLocale(
  createWithRemoteLoader({
    modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
  })(({ remoteModules, tenantId, envArgs, sourceOptions, onSuccess }) => {
    const [FormInfo, usePreset] = remoteModules;
    const { apis, ajax } = usePreset();
    const { formatMessage } = useIntl();
    const { message } = App.useApp();
    const { Select, RadioGroup } = FormInfo.fields;

    return (
      <FormInfo
        column={1}
        list={[
          <RadioGroup
            name="source"
            label={formatMessage({ id: 'OrgLinkSource' })}
            rule="REQ"
            defaultValue="wecom"
            options={(sourceOptions || []).map(item => ({
              value: item.value,
              label: item.label
            }))}
          />,
          <RadioGroup
            name="syncInterval"
            label={formatMessage({ id: 'OrgLinkSyncInterval' })}
            rule="REQ"
            defaultValue="off"
            options={SYNC_INTERVAL_OPTIONS.map(item => ({
              value: item.value,
              label: item.label
            }))}
          />,
          <Select
            name="targetId"
            label={formatMessage({ id: 'OrgLinkTargetId' })}
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

const OrgLinkSetting = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:FormInfo@useFormModal']
})(({ remoteModules, apis, envArgs, onSuccess }) => {
  const [usePreset, useFormModal] = remoteModules;
  const { ajax } = usePreset();
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  const formModal = useFormModal();
  const [syncLoading, setSyncLoading] = useState(false);

  const handleCancelLink = async reload => {
    const { data: resData } = await ajax(Object.assign({}, apis.orgLinkCancel));
    if (resData.code !== 0) {
      return;
    }
    message.success(formatMessage({ id: 'OrgLinkCancelSuccess' }));
    reload();
    onSuccess && onSuccess();
  };

  const handleManualSync = async reload => {
    setSyncLoading(true);
    try {
      const { data: resData } = await ajax(Object.assign({}, apis.orgLinkSync));
      if (resData.code !== 0) {
        return;
      }
      message.success(formatMessage({ id: 'OrgLinkSyncSuccess' }));
      reload();
      onSuccess && onSuccess();
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <Fetch
      {...apis.orgLinkConfig}
      render={({ data, reload }) => {
        const config = data || {};
        const sourceOptions = config.sourceOptions || [];
        const isLinked = config.enabled && config.source;

        if (!isLinked) {
          return (
            <Flex vertical gap={16}>
              <Alert type="info" showIcon message={formatMessage({ id: 'OrgLinkHint' })} />
              <Button
                type="primary"
                icon={<LinkOutlined />}
                onClick={() => {
                  formModal({
                    title: formatMessage({ id: 'OrgLinkEnable' }),
                    size: 'small',
                    formProps: {
                      onSubmit: async formData => {
                        const { data: resData } = await ajax(
                          merge({}, apis.orgLinkSave, {
                            data: Object.assign({}, formData)
                          })
                        );
                        if (resData.code !== 0) {
                          return false;
                        }
                        message.success(formatMessage({ id: 'OrgLinkSaveSuccess' }));
                        onSuccess && onSuccess();
                      }
                    },
                    children: (
                      <LinkFormInner
                        apis={apis}
                        envArgs={envArgs}
                        sourceOptions={sourceOptions}
                        onSuccess={() => {
                          reload();
                          onSuccess && onSuccess();
                        }}
                      />
                    )
                  });
                }}>
                {formatMessage({ id: 'OrgLinkEnable' })}
              </Button>
            </Flex>
          );
        }

        return (
          <Flex vertical gap={16}>
            <Descriptions
              column={1}
              size="small"
              bordered
              items={[
                {
                  key: 'source',
                  label: formatMessage({ id: 'OrgLinkSource' }),
                  children: <Tag color="blue">{getSourceLabel(config.source, sourceOptions)}</Tag>
                },
                {
                  key: 'syncInterval',
                  label: formatMessage({ id: 'OrgLinkSyncInterval' }),
                  children: getSyncIntervalLabel(config.syncInterval)
                },
                {
                  key: 'targetId',
                  label: formatMessage({ id: 'OrgLinkTargetId' }),
                  children: <Tag>{config.targetId}</Tag>
                },
                {
                  key: 'lastSyncTime',
                  label: formatMessage({ id: 'OrgLinkLastSyncTime' }),
                  children: config.lastSyncTime || '—'
                },
                {
                  key: 'status',
                  label: formatMessage({ id: 'OrgLinkStatus' }),
                  children: (() => {
                    const statusInfo = STATUS_MAP[config.status] || { label: config.status || '—', color: 'default' };
                    return <Tag color={statusInfo.color} icon={config.status === 'running' ? <LoadingOutlined /> : null}>{statusInfo.label}</Tag>;
                  })()
                }
              ]}
            />
            <Flex gap={8} justify="flex-end">
              <Tooltip title={config.status === 'running' ? formatMessage({ id: 'OrgLinkSyncRunningTip' }) : null}>
                <Button type="primary" icon={<CloudSyncOutlined />} loading={syncLoading || config.status === 'running'} disabled={config.status === 'running'} onClick={() => handleManualSync(reload)}>
                  {formatMessage({ id: 'OrgLinkManualSync' })}
                </Button>
              </Tooltip>
              <Popconfirm title={formatMessage({ id: 'OrgLinkCancelConfirm' })} onConfirm={() => handleCancelLink(reload)}>
                <Button danger icon={<DisconnectOutlined />}>
                  {formatMessage({ id: 'OrgLinkCancel' })}
                </Button>
              </Popconfirm>
            </Flex>
          </Flex>
        );
      }}
    />
  );
});

export default withLocale(OrgLinkSetting);
