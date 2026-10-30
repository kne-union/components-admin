import { Tabs } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import SmtpSetting from './SmtpSetting';
import TemplateList from './TemplateList';

/**
 * 租户邮件设置：SMTP 配置 + 邮件模版自定义。
 * apis 传 apis.tenant.mailSetting（租户端）或 apis.tenantAdmin.mailSetting（管理端，同时传 tenantId）
 */
const MailSetting = withLocale(({ apis, tenantId, hasEdit = true }) => {
  const { formatMessage } = useIntl();
  return (
    <Tabs
      items={[
        { key: 'smtp', label: formatMessage({ id: 'SmtpSetting' }), children: <SmtpSetting apis={apis} tenantId={tenantId} hasEdit={hasEdit} /> },
        {
          key: 'template',
          label: formatMessage({ id: 'MailTemplate' }),
          children: <TemplateList apis={apis} tenantId={tenantId} hasEdit={hasEdit} />
        }
      ]}
    />
  );
});

MailSetting.SmtpSetting = SmtpSetting;
MailSetting.TemplateList = TemplateList;

export default MailSetting;
