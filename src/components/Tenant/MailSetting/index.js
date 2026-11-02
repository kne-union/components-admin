import { Tabs } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import SmtpSetting from './SmtpSetting';
import TemplateList from './TemplateList';

/**
 * 租户消息设置：SMTP 配置 + 消息模版（邮件 / 短信）自定义。
 * apis 传 apis.tenant.mailSetting（租户端）或 apis.tenantAdmin.mailSetting（管理端，同时传 tenantId）
 * renderFooter(actions) 可把 SMTP 表单的操作按钮放到页面底栏（如 system-layout 的 Page.Footer）
 * editableTypes 限定可自定义的模版类型（0 邮件，1 短信），其它类型只能预览
 * permissions 按子模块控制：{ smtp: { view, edit }, template: { view, edit } }，view 为 false 的页签不显示；不传时全部可见、编辑权限取 hasEdit
 */
const MailSetting = withLocale(({ apis, tenantId, hasEdit = true, permissions, editableTypes, renderFooter }) => {
  const { formatMessage } = useIntl();
  const getPermission = key => Object.assign({ view: true, edit: hasEdit }, permissions && permissions[key]);
  const smtp = getPermission('smtp');
  const template = getPermission('template');
  return (
    <Tabs
      destroyOnHidden
      items={[
        smtp.view && {
          key: 'smtp',
          label: formatMessage({ id: 'SmtpSetting' }),
          children: <SmtpSetting apis={apis} tenantId={tenantId} hasEdit={smtp.edit} renderFooter={renderFooter} />
        },
        template.view && {
          key: 'template',
          label: formatMessage({ id: 'MailTemplate' }),
          children: <TemplateList apis={apis} tenantId={tenantId} hasEdit={template.edit} editableTypes={editableTypes} />
        }
      ].filter(Boolean)}
    />
  );
});

MailSetting.SmtpSetting = SmtpSetting;
MailSetting.TemplateList = TemplateList;

export default MailSetting;
