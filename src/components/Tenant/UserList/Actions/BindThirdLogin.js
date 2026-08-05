import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { App, Button, Flex, Input, Radio, Space, Typography, Tag, Spin } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';
import { getSourceIcon, SOURCE_LABEL_MAP } from '../../constants';
import { useEffect, useRef, useState } from 'react';

const getBoundBinding = data => {
  const binding = data?.options?.thirdLogin;
  if (binding?.platform && binding?.sourceId) {
    return binding;
  }
  return null;
};

const channelKey = item => `${item.source}::${item.targetId || ''}`;

/**
 * 交互对齐「邀请用户」：
 * 1. 列表点「绑定第三方登录」打开弹窗
 * 2. 选配置项后自动生成链接（单配置直接生成）
 * 3. 展示链接 + 复制；需要时可「重新生成」
 */
const BindModalContent = ({ channels, data, apis, ajax, formatMessage, message }) => {
  const [selectedKey, setSelectedKey] = useState(channels.length === 1 ? channelKey(channels[0]) : undefined);
  const [bindUrl, setBindUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const requestSeq = useRef(0);

  const copyLink = async url => {
    await navigator.clipboard.writeText(url);
    message.success(formatMessage({ id: 'CopySuccess' }));
  };

  const generate = async key => {
    const channel = channels.find(item => channelKey(item) === key);
    if (!channel) {
      return;
    }
    const seq = ++requestSeq.current;
    setGenerating(true);
    try {
      const { data: resData } = await ajax(
        merge({}, apis.thirdLoginBindToken, {
          data: Object.assign(
            { id: data.id, platform: channel.source },
            channel.targetId ? { targetId: channel.targetId } : {}
          )
        })
      );
      if (seq !== requestSeq.current) {
        return;
      }
      if (resData.code !== 0) {
        setBindUrl('');
        return;
      }
      setBindUrl(resData.data?.url || '');
    } finally {
      if (seq === requestSeq.current) {
        setGenerating(false);
      }
    }
  };

  useEffect(() => {
    if (selectedKey) {
      generate(selectedKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  const selectedChannel = channels.find(item => channelKey(item) === selectedKey);

  return (
    <Flex vertical gap={16}>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        {formatMessage({ id: 'ThirdLoginBindHint' })}
      </Typography.Paragraph>

      {channels.length > 1 ? (
        <div>
          <div style={{ marginBottom: 8 }}>{formatMessage({ id: 'ThirdLoginBindPlatform' })}</div>
          <Radio.Group
            value={selectedKey}
            onChange={e => setSelectedKey(e.target.value)}
            options={channels.map(item => ({
              value: channelKey(item),
              label: (
                <Space align="center">
                  {getSourceIcon(item.source)}
                  <span>{SOURCE_LABEL_MAP[item.source] || item.source}</span>
                  {item.targetId ? <Tag>{item.targetId}</Tag> : null}
                </Space>
              )
            }))}
          />
        </div>
      ) : (
        <Space>
          <Tag icon={getSourceIcon(channels[0].source)} color="processing">
            {SOURCE_LABEL_MAP[channels[0].source] || channels[0].source}
          </Tag>
          {channels[0].targetId ? <Tag>{channels[0].targetId}</Tag> : null}
        </Space>
      )}

      {!selectedChannel ? (
        <Typography.Text type="secondary">{formatMessage({ id: 'ThirdLoginBindPlatform' })}</Typography.Text>
      ) : generating && !bindUrl ? (
        <Flex align="center" gap={8}>
          <Spin size="small" />
          <Typography.Text type="secondary">{formatMessage({ id: 'ThirdLoginBindGenerating' })}</Typography.Text>
        </Flex>
      ) : bindUrl ? (
        <div>
          <div style={{ marginBottom: 8 }}>{formatMessage({ id: 'ThirdLoginBindLink' })}</div>
          <Space.Compact style={{ width: '100%' }}>
            <Input readOnly value={bindUrl} />
            <Button icon={<CopyOutlined />} onClick={() => copyLink(bindUrl)}>
              {formatMessage({ id: 'ThirdLoginBindCopy' })}
            </Button>
          </Space.Compact>
        </div>
      ) : null}
    </Flex>
  );
};

const BindThirdLoginInner = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:ConfirmButton', 'components-core:Modal@useModal', 'components-core:Global@usePreset']
})(({ remoteModules, data, apis, onSuccess, ...props }) => {
  const [LoadingButton, ConfirmButton, useModal, usePreset] = remoteModules;
  const { ajax } = usePreset();
  const modal = useModal();
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  const bound = getBoundBinding(data);

  if (bound) {
    return (
      <ConfirmButton
        {...props}
        message={formatMessage({ id: 'ThirdLoginUnbindConfirm' })}
        onClick={async () => {
          const { data: resData } = await ajax(
            merge({}, apis.thirdLoginUnbind, {
              data: { id: data.id }
            })
          );
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'ThirdLoginUnbindSuccess' }));
          onSuccess && onSuccess();
        }}
      />
    );
  }

  return (
    <LoadingButton
      {...props}
      onClick={async () => {
        const { data: configRes } = await ajax(merge({}, apis.thirdLoginConfig));
        if (configRes.code !== 0) {
          return;
        }
        const channels = configRes.data?.list || [];
        if (!channels.length) {
          message.warning(formatMessage({ id: 'ThirdLoginNoChannel' }));
          return;
        }

        modal({
          title: formatMessage({ id: 'ThirdLoginBind' }),
          size: 'small',
          width: 560,
          footer: null,
          children: (
            <BindModalContent channels={channels} data={data} apis={apis} ajax={ajax} formatMessage={formatMessage} message={message} />
          )
        });
      }}
    />
  );
});

export default withLocale(BindThirdLoginInner);
