import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import Fetch from '@kne/react-fetch';
import { Alert, App, Button, Descriptions, Flex, Tag } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import { createRequest } from '../MailSetting/utils';
import { splitDuration, toMfaFormData, toMfaPayload } from './utils';

const formatMaxAge = (formatMessage, maxAge) => {
  const parts = splitDuration(maxAge);
  if (parts.length === 0) {
    return formatMessage({ id: 'MaxAgeEveryTime' });
  }
  return parts.map(([id, count]) => formatMessage({ id }, { count })).join(' ');
};

const MfaForm = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(({ remoteModules, data, apis, tenantId, renderFooter, onSuccess, onCancel }) => {
  const [FormInfo, usePreset] = remoteModules;
  const { Form, SubmitButton, CancelButton } = FormInfo;
  const { InputNumber, Switch } = FormInfo.fields;
  const { ajax } = usePreset();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();

  const actions = (
    <Flex justify="flex-end" gap={12}>
      <SubmitButton>{formatMessage({ id: 'Save' })}</SubmitButton>
      <CancelButton onClick={onCancel}>{formatMessage({ id: 'Cancel' })}</CancelButton>
    </Flex>
  );

  return (
    <Form
      type="default"
      data={toMfaFormData(data)}
      onSubmit={async formData => {
        const { data: resData } = await ajax(createRequest(apis.save, tenantId, toMfaPayload(formData)));
        if (resData.code !== 0) {
          return;
        }
        message.success(formatMessage({ id: 'SaveSuccess' }));
        onSuccess && onSuccess();
      }}
    >
      <FormInfo
        title={formatMessage({ id: 'MfaSetting' })}
        column={1}
        list={[
          <Switch name="enabled" label={formatMessage({ id: 'MfaEnabled' })} />,
          <InputNumber
            name="maxAgeMinutes"
            label={formatMessage({ id: 'MaxAgeMinutes' })}
            rule="REQ"
            min={0}
            precision={0}
            tips={formatMessage({ id: 'MaxAgeTips' })}
          />
        ]}
      />
      {typeof renderFooter === 'function' ? renderFooter(actions) : actions}
    </Form>
  );
});

const MfaView = ({ data, hasEdit, onEdit }) => {
  const { formatMessage } = useIntl();
  return (
    <Flex vertical gap={12}>
      <Alert type="info" showIcon message={formatMessage({ id: 'MfaDescription' })} />
      <Descriptions
        column={1}
        size="small"
        bordered
        items={[
          {
            key: 'enabled',
            label: formatMessage({ id: 'Status' }),
            children: data?.enabled ? <Tag color="green">{formatMessage({ id: 'Enabled' })}</Tag> : <Tag>{formatMessage({ id: 'Disabled' })}</Tag>
          },
          { key: 'methods', label: formatMessage({ id: 'MfaMethods' }), children: formatMessage({ id: 'MethodSms' }) },
          { key: 'maxAge', label: formatMessage({ id: 'MaxAge' }), children: formatMaxAge(formatMessage, data?.maxAge) }
        ]}
      />
      {hasEdit && (
        <Flex justify="flex-end">
          <Button type="primary" icon={<FormOutlined />} onClick={onEdit}>
            {formatMessage({ id: 'Edit' })}
          </Button>
        </Flex>
      )}
    </Flex>
  );
};

/**
 * 租户 MFA（短信验证）设置。
 * apis 传 apis.tenant.mfaSetting（租户端）或 apis.tenantAdmin.mfaSetting（管理端，同时传 tenantId）
 * renderFooter(actions) 可把编辑表单的操作按钮放到页面底栏
 */
const MfaSetting = withLocale(({ apis, tenantId, hasEdit = true, renderFooter }) => {
  const [isEdit, setIsEdit] = useState(false);
  return (
    <Fetch
      {...createRequest(apis.detail, tenantId)}
      render={({ data, reload }) => {
        if (isEdit && hasEdit) {
          return (
            <MfaForm
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
        return <MfaView data={data} hasEdit={hasEdit} onEdit={() => setIsEdit(true)} />;
      }}
    />
  );
});

export default MfaSetting;
