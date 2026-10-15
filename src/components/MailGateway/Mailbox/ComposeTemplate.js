import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import { App, Flex, Typography } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { TemplateSelect } from '../fields';
import style from '../style.module.scss';

const ComposeTemplate = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, mailId, quoteHtml, onApply }) => {
    const [FormInfo, usePreset] = remoteModules;
    const { openApi } = FormInfo.useFormContext();
    const { ajax, apis } = usePreset();
    const { message, modal } = App.useApp();
    const { formatMessage } = useIntl();
    const [value, setValue] = useState();
    const [loading, setLoading] = useState(false);

    const applyTemplate = async templateId => {
      const formData = openApi.getFormData();
      setLoading(true);
      const { data: resData } = await ajax(
        Object.assign({}, apis.mailGateway.template.render, {
          data: Object.assign({ id: templateId }, mailId ? { mailId } : {}, formData.accountId ? { accountId: formData.accountId } : {})
        })
      ).finally(() => setLoading(false));
      if (resData.code !== 0) {
        return;
      }
      const rendered = resData.data || {};
      openApi.setFields([
        { name: 'subject', value: rendered.subject || formData.subject || '' },
        { name: 'html', value: `${rendered.html || ''}${quoteHtml || ''}` }
      ]);
      setValue(templateId);
      onApply && onApply();
      message.success(formatMessage({ id: 'TemplateApplied' }));
    };

    return (
      <Flex vertical gap={4} className={style['compose-template']}>
        <TemplateSelect
          value={value}
          loading={loading}
          placeholder={formatMessage({ id: 'UseTemplatePlaceholder' })}
          onChange={templateId => {
            if (!templateId) {
              setValue(undefined);
              return;
            }
            const formData = openApi.getFormData();
            const current = String(formData.html || '').trim();
            if (current && current !== String(quoteHtml || '').trim()) {
              modal.confirm({
                title: formatMessage({ id: 'UseTemplate' }),
                content: formatMessage({ id: 'ConfirmOverwriteContent' }),
                onOk: () => applyTemplate(templateId)
              });
              return;
            }
            return applyTemplate(templateId);
          }}
        />
        <Typography.Text type="secondary">{formatMessage({ id: 'UseTemplateTips' })}</Typography.Text>
      </Flex>
    );
  })
);

export default ComposeTemplate;
