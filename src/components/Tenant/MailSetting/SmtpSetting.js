import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import Fetch from '@kne/react-fetch';
import { Alert, App, Button, Card, Descriptions, Flex, Tag, Typography } from 'antd';
import { CheckCircleFilled, FormOutlined, InfoCircleOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import { useIsMobile } from '@kne/responsive-utils';
import withLocale from './withLocale';
import { createRequest, getSmtpConnectionKey, getSmtpSaveState, toSmtpFormData, toSmtpPayload } from './utils';
import style from './style.module.scss';

const SAVE_STATE_TIPS = { passed: 'SmtpTestPassed', required: 'SmtpTestRequired', outdated: 'SmtpTestOutdated' };

const SmtpFormActions = ({ FormInfo, testedKey, savedKey, onTest, onCancel }) => {
  const { SubmitButton, CancelButton, FormApiButton } = FormInfo;
  const { formData } = FormInfo.useFormContext();
  const { formatMessage } = useIntl();
  const saveState = getSmtpSaveState({ formData, testedKey, savedKey });
  const canSave = saveState === 'ready' || saveState === 'passed';
  const tipId = SAVE_STATE_TIPS[saveState];

  return (
    <Flex align="center" justify="flex-end" gap={12} wrap>
      {tipId && (
        <Typography.Text type={saveState === 'passed' ? 'success' : 'secondary'}>
          {saveState === 'passed' ? <CheckCircleFilled /> : <InfoCircleOutlined />} {formatMessage({ id: tipId })}
        </Typography.Text>
      )}
      <FormApiButton type={canSave ? 'default' : 'primary'} onClick={onTest}>
        {formatMessage({ id: 'TestSmtp' })}
      </FormApiButton>
      <SubmitButton disabled={!canSave}>{formatMessage({ id: 'Save' })}</SubmitButton>
      <CancelButton onClick={onCancel}>{formatMessage({ id: 'Cancel' })}</CancelButton>
    </Flex>
  );
};

const SmtpForm = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(({ remoteModules, data, apis, tenantId, renderFooter, onSuccess, onCancel }) => {
  const [FormInfo, usePreset] = remoteModules;
  const { Form } = FormInfo;
  const { Input, Password, InputNumber, Switch } = FormInfo.fields;
  const { ajax } = usePreset();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();
  const isMobile = useIsMobile();
  const hasPassword = !!data?.hasPassword;
  const [testedKey, setTestedKey] = useState(null);
  const savedKey = data?.configured ? getSmtpConnectionKey(toSmtpFormData(data)) : null;

  const actions = (
    <SmtpFormActions
      FormInfo={FormInfo}
      testedKey={testedKey}
      savedKey={savedKey}
      onCancel={onCancel}
      onTest={async ({ openApi }) => {
        const formData = openApi.getFormData();
        if (!formData.host || !formData.user) {
          message.warning(formatMessage({ id: 'TestSmtpNeedFields' }));
          return;
        }
        const key = getSmtpConnectionKey(formData);
        const to = formData.testTo || undefined;
        const { data: resData } = await ajax(createRequest(apis.smtpTest, tenantId, Object.assign(toSmtpPayload(formData), { to })));
        if (resData.code !== 0) {
          setTestedKey(null);
          return;
        }
        setTestedKey(key);
        message.success(formatMessage({ id: to ? 'TestMailSent' : 'TestSmtpSuccess' }));
      }}
    />
  );

  return (
    <Form
      type="default"
      data={toSmtpFormData(data)}
      onSubmit={async formData => {
        const saveState = getSmtpSaveState({ formData, testedKey, savedKey });
        if (saveState === 'required' || saveState === 'outdated') {
          message.warning(formatMessage({ id: SAVE_STATE_TIPS[saveState] }));
          return;
        }
        const { data: resData } = await ajax(createRequest(apis.smtpSave, tenantId, toSmtpPayload(formData)));
        if (resData.code !== 0) {
          return;
        }
        message.success(formatMessage({ id: 'SaveSuccess' }));
        onSuccess && onSuccess();
      }}
    >
      <FormInfo
        title={formatMessage({ id: 'SmtpSetting' })}
        column={isMobile ? 1 : 2}
        list={[
          <Switch name="enabled" label={formatMessage({ id: 'SmtpEnabled' })} />,
          <Switch name="secure" label="SSL/TLS" />,
          <Input name="host" label={formatMessage({ id: 'SmtpHost' })} rule="REQ LEN-1-200" placeholder="smtp.example.com" />,
          <InputNumber name="port" label={formatMessage({ id: 'SmtpPort' })} rule="REQ" min={1} max={65535} />,
          <Input name="user" label={formatMessage({ id: 'SmtpUser' })} rule="REQ LEN-1-200" />,
          <Password
            name="pass"
            label={formatMessage({ id: 'SmtpPass' })}
            rule={hasPassword ? 'LEN-0-200' : 'REQ LEN-1-200'}
            tips={formatMessage({ id: hasPassword ? 'SmtpPassEditTips' : 'SmtpPassTips' })}
          />,
          <Input name="fromName" label={formatMessage({ id: 'FromName' })} rule="LEN-0-100" tips={formatMessage({ id: 'FromNameTips' })} />,
          <Input name="fromAddress" label={formatMessage({ id: 'FromAddress' })} rule="LEN-0-200" tips={formatMessage({ id: 'FromAddressTips' })} />,
          <Input name="testTo" label={formatMessage({ id: 'TestSmtpTo' })} rule="LEN-0-200" tips={formatMessage({ id: 'TestSmtpToTips' })} />
        ]}
      />
      {typeof renderFooter === 'function' ? renderFooter(actions) : actions}
    </Form>
  );
});

const SmtpView = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Modal@useConfirmModal']
})(({ remoteModules, data, apis, tenantId, hasEdit, onEdit, onSuccess }) => {
  const [usePreset, useConfirmModal] = remoteModules;
  const { ajax } = usePreset();
  const confirmModal = useConfirmModal();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();
  const configured = !!data?.configured;

  if (!configured) {
    return (
      // part：system-layout 页面内渲染为玻璃卡片
      <Card className="part">
        <div className={style.smtpEmpty}>
          <span className={style.smtpEmptyIcon}>
            <MailOutlined />
          </span>
          <div className={style.smtpEmptyTitle}>{formatMessage({ id: 'SmtpNotConfigured' })}</div>
          <div className={style.smtpEmptyDescription}>{formatMessage({ id: 'SmtpEmptyDescription' })}</div>
          {hasEdit && (
            <Button type="primary" size="large" icon={<SettingOutlined />} onClick={onEdit}>
              {formatMessage({ id: 'SmtpConfigureNow' })}
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Flex vertical gap={12}>
      {!data.enabled && <Alert type="warning" showIcon message={formatMessage({ id: 'SmtpDisabledTips' })} />}
      <Descriptions
        column={1}
        size="small"
        bordered
        items={[
          {
            key: 'enabled',
            label: formatMessage({ id: 'Status' }),
            children: data.enabled ? <Tag color="green">{formatMessage({ id: 'Enabled' })}</Tag> : <Tag>{formatMessage({ id: 'Disabled' })}</Tag>
          },
          { key: 'host', label: formatMessage({ id: 'SmtpHost' }), children: `${data.host}:${data.port}` },
          { key: 'secure', label: 'SSL/TLS', children: data.secure ? 'ON' : 'OFF' },
          { key: 'user', label: formatMessage({ id: 'SmtpUser' }), children: data.user },
          { key: 'pass', label: formatMessage({ id: 'SmtpPass' }), children: data.hasPassword ? formatMessage({ id: 'SmtpPassSaved' }) : '-' },
          { key: 'fromName', label: formatMessage({ id: 'FromName' }), children: data.fromName || '-' },
          { key: 'fromAddress', label: formatMessage({ id: 'FromAddress' }), children: data.fromAddress || '-' }
        ]}
      />
      {hasEdit && (
        <Flex justify="flex-end" gap={8}>
          <Button
            danger
            onClick={() => {
              confirmModal({
                danger: true,
                title: formatMessage({ id: 'RemoveSmtp' }),
                message: formatMessage({ id: 'RemoveSmtpConfirm' }),
                onConfirm: async () => {
                  const { data: resData } = await ajax(createRequest(apis.smtpRemove, tenantId));
                  if (resData.code !== 0) {
                    return false;
                  }
                  message.success(formatMessage({ id: 'RemoveSuccess' }));
                  onSuccess && onSuccess();
                }
              });
            }}
          >
            {formatMessage({ id: 'RemoveSmtp' })}
          </Button>
          <Button type="primary" icon={<FormOutlined />} onClick={onEdit}>
            {formatMessage({ id: 'Edit' })}
          </Button>
        </Flex>
      )}
    </Flex>
  );
});

const SmtpSetting = withLocale(({ apis, tenantId, hasEdit = true, renderFooter }) => {
  const [isEdit, setIsEdit] = useState(false);
  return (
    <Fetch
      {...createRequest(apis.smtpDetail, tenantId)}
      render={({ data, reload }) => {
        if (isEdit && hasEdit) {
          return (
            <SmtpForm
              data={data}
              apis={apis}
              tenantId={tenantId}
              renderFooter={renderFooter}
              onCancel={() => setIsEdit(false)}
              onSuccess={() => {
                setIsEdit(false);
                reload();
              }}
            />
          );
        }
        return <SmtpView data={data} apis={apis} tenantId={tenantId} hasEdit={hasEdit} onEdit={() => setIsEdit(true)} onSuccess={reload} />;
      }}
    />
  );
});

export default SmtpSetting;
