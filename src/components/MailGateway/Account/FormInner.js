import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Flex } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { showTestResult } from './TestConnectionResult';

export const toAccountPayload = formData => ({
  name: formData.name,
  address: formData.address,
  username: formData.username,
  password: formData.password || undefined,
  imap: { host: formData.imapHost, port: Number(formData.imapPort), secure: !!formData.imapSecure },
  smtp: { host: formData.smtpHost, port: Number(formData.smtpPort), secure: !!formData.smtpSecure },
  skipVerify: !!formData.skipVerify
});

export const toAccountFormData = data => ({
  name: data.name,
  address: data.address,
  username: data.username,
  imapHost: data.imap?.host,
  imapPort: data.imap?.port,
  imapSecure: data.imap?.secure,
  smtpHost: data.smtp?.host,
  smtpPort: data.smtp?.port,
  smtpSecure: data.smtp?.secure
});

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, action, data }) => {
    const [FormInfo, usePreset] = remoteModules;
    const { Input, Password, InputNumber, Switch } = FormInfo.fields;
    const { FormApiButton } = FormInfo;
    const { ajax, apis } = usePreset();
    const { message, modal } = App.useApp();
    const { formatMessage } = useIntl();
    const isEdit = action === 'edit';
    const accountId = isEdit ? data?.id : null;

    return (
      <>
        <FormInfo
          title={formatMessage({ id: 'BasicInfo' })}
          column={2}
          list={[
            <Input name="name" label={formatMessage({ id: 'AccountName' })} rule="REQ LEN-1-50" tips={formatMessage({ id: 'AccountNameTips' })} />,
            <Input name="address" label={formatMessage({ id: 'AccountAddress' })} rule="REQ EMAIL" />,
            <Input name="username" label={formatMessage({ id: 'Username' })} rule="REQ LEN-1-100" />,
            <Password
              name="password"
              label={formatMessage({ id: 'Password' })}
              rule={isEdit ? 'LEN-0-200' : 'REQ LEN-1-200'}
              tips={formatMessage({ id: isEdit ? 'PasswordEditTips' : 'PasswordTips' })}
            />
          ]}
        />
        <FormInfo
          title="IMAP"
          column={3}
          list={[
            <Input name="imapHost" label={formatMessage({ id: 'Host' })} rule="REQ LEN-1-200" placeholder="imap.example.com" />,
            <InputNumber name="imapPort" label={formatMessage({ id: 'Port' })} rule="REQ" min={1} max={65535} defaultValue={993} />,
            <Switch name="imapSecure" label="SSL/TLS" defaultValue={true} />
          ]}
        />
        <FormInfo
          title="SMTP"
          column={3}
          list={[
            <Input name="smtpHost" label={formatMessage({ id: 'Host' })} rule="REQ LEN-1-200" placeholder="smtp.example.com" />,
            <InputNumber name="smtpPort" label={formatMessage({ id: 'Port' })} rule="REQ" min={1} max={65535} defaultValue={465} />,
            <Switch name="smtpSecure" label="SSL/TLS" defaultValue={true} />
          ]}
        />
        <FormInfo
          column={1}
          list={[<Switch name="skipVerify" label={formatMessage({ id: 'SkipVerify' })} tips={formatMessage({ id: 'SkipVerifyTips' })} />]}
        />
        <Flex justify="flex-end">
          <FormApiButton
            onClick={async ({ openApi }) => {
              const formData = openApi.getFormData();
              const payload = Object.assign(toAccountPayload(formData), accountId ? { id: accountId } : null);
              if ((!payload.password && !accountId) || !payload.imap.host || !payload.smtp.host || !payload.username) {
                message.warning(formatMessage({ id: 'TestConnectionNeedFields' }));
                return;
              }
              const { data: resData } = await ajax(Object.assign({}, apis.mailGateway.account.testConnection, { data: payload }));
              if (resData.code !== 0) {
                return;
              }
              showTestResult({ modal, formatMessage, result: resData.data });
            }}
          >
            {formatMessage({ id: 'TestConnection' })}
          </FormApiButton>
        </Flex>
      </>
    );
  })
);

export default FormInner;
