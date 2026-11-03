import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Tag, Button, App, Popconfirm, Tooltip, Typography } from 'antd';
import { LinkOutlined, DisconnectOutlined, CloudSyncOutlined, LoadingOutlined } from '@ant-design/icons';
import { Fragment, useState } from 'react';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import Fetch from '@kne/react-fetch';
import merge from 'lodash/merge';
import dayjs from 'dayjs';
import { getSourceIcon } from '../constants';
import SettingIntro from './SettingIntro';
import style from './style.module.scss';

const SOURCE_LOCALE_IDS = {
  wecom: 'SourceWecom',
  dingtalk: 'SourceDingtalk',
  beisen: 'SourceBeisen'
};

const SYNC_INTERVAL_OPTIONS = [
  { value: 'daily', labelId: 'OrgLinkIntervalDaily' },
  { value: 'weekly', labelId: 'OrgLinkIntervalWeekly' },
  { value: 'monthly', labelId: 'OrgLinkIntervalMonthly' },
  { value: 'yearly', labelId: 'OrgLinkIntervalYearly' },
  { value: 'off', labelId: 'OrgLinkIntervalOff' }
];

const getSourceLabel = (value, formatMessage) => formatMessage({ id: SOURCE_LOCALE_IDS[value] });

const getSyncIntervalLabel = (value, formatMessage) => {
  const item = SYNC_INTERVAL_OPTIONS.find(o => o.value === value);
  return formatMessage({ id: item.labelId });
};

const STATUS_MAP = {
  pending: { labelId: 'OrgLinkStatusPending', color: 'default' },
  running: { labelId: 'OrgLinkStatusRunning', color: 'processing' },
  success: { labelId: 'OrgLinkStatusSuccess', color: 'success' },
  failed: { labelId: 'OrgLinkStatusFailed', color: 'error' }
};

const getLinkedEnvArgs = envArgs => (envArgs || []).filter(item => item.key && item.key.startsWith('TARGET_LINKED_'));

const LinkFormInner = withLocale(
  createWithRemoteLoader({
    modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
  })(({ remoteModules, envArgs, sourceOptions }) => {
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
              label: formatMessage({ id: SOURCE_LOCALE_IDS[item.value] })
            }))}
          />,
          <RadioGroup
            name="syncInterval"
            label={formatMessage({ id: 'OrgLinkSyncInterval' })}
            rule="REQ"
            defaultValue="off"
            options={SYNC_INTERVAL_OPTIONS.map(item => ({
              value: item.value,
              label: formatMessage({ id: item.labelId })
            }))}
          />,
          <Select
            name="targetId"
            label={formatMessage({ id: 'OrgLinkTargetId' })}
            rule="REQ"
            options={getLinkedEnvArgs(envArgs).map(item => ({
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

        const targetOptions = getLinkedEnvArgs(envArgs);
        const targetName = (targetOptions.find(item => item.key === config.targetId) || {}).name;

        if (!isLinked) {
          return (
            <Flex vertical gap={16}>
              <SettingIntro
                icon={<CloudSyncOutlined />}
                title={formatMessage({ id: 'OrgLinkTitle' })}
                description={formatMessage({ id: 'OrgLinkHint' })}
              />
              {sourceOptions.length ? (
                <Flex vertical gap={8}>
                  <span className={style['setting-section-title']}>{formatMessage({ id: 'OrgLinkAvailableSources' })}</span>
                  <div className={style['setting-source-list']}>
                    {sourceOptions.map(item => (
                      <span key={item.value} className={style['setting-source-item']}>
                        {getSourceIcon(item.value)}
                        {getSourceLabel(item.value, formatMessage)}
                      </span>
                    ))}
                  </div>
                </Flex>
              ) : null}
              {targetOptions.length ? null : <Typography.Text type="secondary">{formatMessage({ id: 'OrgLinkNoTargetTip' })}</Typography.Text>}
              <Button
                type="primary"
                icon={<LinkOutlined />}
                disabled={!targetOptions.length}
                onClick={() => {
                  formModal({
                    title: formatMessage({ id: 'OrgLinkEnable' }),
                    size: 'small',
                    saveText: formatMessage({ id: 'OrgLinkEnable' }),
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
                        reload();
                        onSuccess && onSuccess();
                      }
                    },
                    children: <LinkFormInner envArgs={envArgs} sourceOptions={sourceOptions} />
                  });
                }}
              >
                {formatMessage({ id: 'OrgLinkEnable' })}
              </Button>
            </Flex>
          );
        }

        const statusInfo = STATUS_MAP[config.status];
        const isRunning = config.status === 'running';
        const fields = [
          {
            key: 'syncInterval',
            label: formatMessage({ id: 'OrgLinkSyncInterval' }),
            value: getSyncIntervalLabel(config.syncInterval, formatMessage)
          },
          {
            key: 'targetId',
            label: formatMessage({ id: 'OrgLinkTargetId' }),
            value: targetName ? (
              <Tooltip title={config.targetId}>
                <span>{targetName}</span>
              </Tooltip>
            ) : (
              config.targetId
            )
          },
          {
            key: 'lastSyncTime',
            label: formatMessage({ id: 'OrgLinkLastSyncTime' }),
            value: config.lastSyncTime && dayjs(config.lastSyncTime).isValid() ? dayjs(config.lastSyncTime).format('YYYY-MM-DD HH:mm:ss') : '—'
          }
        ];

        return (
          <Flex vertical gap={16}>
            <SettingIntro
              icon={<CloudSyncOutlined />}
              title={formatMessage({ id: 'OrgLinkTitle' })}
              description={formatMessage({ id: 'OrgLinkHint' })}
            />
            <div className={style['setting-card']}>
              <Flex gap={12} align="center">
                <span className={style['setting-card-icon']}>{getSourceIcon(config.source)}</span>
                <Flex vertical className={style['setting-card-main']}>
                  <span className={style['setting-card-name']}>{getSourceLabel(config.source, formatMessage)}</span>
                  <span className={style['setting-card-sub']}>{formatMessage({ id: 'OrgLinkSource' })}</span>
                </Flex>
                <Tag bordered={false} color={statusInfo ? statusInfo.color : 'default'} icon={isRunning ? <LoadingOutlined /> : null}>
                  {statusInfo ? formatMessage({ id: statusInfo.labelId }) : config.status || '—'}
                </Tag>
              </Flex>
              <div className={style['setting-card-fields']}>
                {fields.map(item => (
                  <Fragment key={item.key}>
                    <span className={style['setting-card-label']}>{item.label}</span>
                    <span className={style['setting-card-value']}>{item.value}</span>
                  </Fragment>
                ))}
              </div>
              <Flex gap={8} justify="flex-end" className={style['setting-card-footer']}>
                <Popconfirm title={formatMessage({ id: 'OrgLinkCancelConfirm' })} onConfirm={() => handleCancelLink(reload)}>
                  <Button danger size="small" type="text" icon={<DisconnectOutlined />}>
                    {formatMessage({ id: 'OrgLinkCancel' })}
                  </Button>
                </Popconfirm>
                <Tooltip title={isRunning ? formatMessage({ id: 'OrgLinkSyncRunningTip' }) : null}>
                  <Button
                    type="primary"
                    size="small"
                    icon={<CloudSyncOutlined />}
                    loading={syncLoading || isRunning}
                    disabled={isRunning}
                    onClick={() => handleManualSync(reload)}
                  >
                    {formatMessage({ id: 'OrgLinkManualSync' })}
                  </Button>
                </Tooltip>
              </Flex>
            </div>
          </Flex>
        );
      }}
    />
  );
});

export default withLocale(OrgLinkSetting);
