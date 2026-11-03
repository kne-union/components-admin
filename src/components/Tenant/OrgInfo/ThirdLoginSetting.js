import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Button, App, Popconfirm, Tooltip, Empty } from 'antd';
import { PlusOutlined, DisconnectOutlined, LoginOutlined } from '@ant-design/icons';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import Fetch from '@kne/react-fetch';
import merge from 'lodash/merge';
import { getSourceIcon, SOURCE_LABEL_MAP } from '../constants';
import SettingIntro from './SettingIntro';
import style from './style.module.scss';

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

        const targetNameMap = new Map(getLinkedEnvArgs(envArgs).map(item => [item.key, item.name]));
        const canAdd = availableTargets.length > 0 && sourceOptions.length > 0;

        const handleAdd = () => {
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
        };

        return (
          <Flex vertical gap={16}>
            <SettingIntro
              icon={<LoginOutlined />}
              title={formatMessage({ id: 'ThirdLoginConfigTitle' })}
              description={formatMessage({ id: 'ThirdLoginConfigHint' })}
            />
            <Flex justify="space-between" align="center">
              <span className={style['setting-section-title']}>
                {formatMessage({ id: 'ThirdLoginConfigListTitle' })}
                <span className={style['setting-section-count']}>{list.length}</span>
              </span>
              {canAdd ? (
                <Button type="link" size="small" icon={<PlusOutlined />} onClick={handleAdd}>
                  {formatMessage({ id: 'ThirdLoginConfigAdd' })}
                </Button>
              ) : null}
            </Flex>
            {list.length ? (
              <Flex vertical gap={8}>
                {list.map(item => {
                  const targetName = targetNameMap.get(item.targetId);
                  return (
                    <Flex key={`${item.source}-${item.targetId}`} className={style['setting-card']} gap={12} align="center">
                      <span className={style['setting-card-icon']}>{getSourceIcon(item.source)}</span>
                      <Flex vertical className={style['setting-card-main']}>
                        <span className={style['setting-card-name']}>
                          {SOURCE_LABEL_MAP[item.source] || getSourceLabel(item.source, sourceOptions)}
                        </span>
                        <Tooltip title={targetName ? item.targetId : null}>
                          <span className={style['setting-card-sub']}>{targetName || item.targetId}</span>
                        </Tooltip>
                      </Flex>
                      <Popconfirm
                        title={formatMessage({ id: 'ThirdLoginConfigCancelConfirm' })}
                        onConfirm={() => handleCancel({ source: item.source, targetId: item.targetId }, reload)}
                      >
                        <Button danger size="small" type="text" icon={<DisconnectOutlined />}>
                          {formatMessage({ id: 'ThirdLoginConfigCancel' })}
                        </Button>
                      </Popconfirm>
                    </Flex>
                  );
                })}
              </Flex>
            ) : (
              <Empty
                className={style['setting-empty']}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={formatMessage({ id: canAdd ? 'ThirdLoginConfigEmpty' : 'ThirdLoginConfigNoTarget' })}
              >
                {canAdd ? (
                  <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAdd}>
                    {formatMessage({ id: 'ThirdLoginConfigAdd' })}
                  </Button>
                ) : null}
              </Empty>
            )}
          </Flex>
        );
      }}
    />
  );
});

export default withLocale(ThirdLoginSetting);
