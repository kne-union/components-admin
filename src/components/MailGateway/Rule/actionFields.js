import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import { Flex, Typography } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale, { createFormatMessage } from '../withLocale';
import { ContactSelectField, createField, LabelSelectField, TemplateSelectField } from '../fields';
import MailEditor, { TemplateTextInput } from '../MailEditor';
import style from '../style.module.scss';

const JsonInput = createWithRemoteLoader({
  modules: ['components-thirdparty:JSONEditor']
})(
  withLocale(({ remoteModules, value, onChange }) => {
    const [JSONEditor] = remoteModules;
    const { formatMessage } = useIntl();
    const [text, setText] = useState(() => (value && typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''));
    const [error, setError] = useState(false);
    return (
      <Flex vertical gap={4}>
        <JSONEditor.Field
          className={style['json-input']}
          value={text}
          onChange={next => {
            next = next || '';
            setText(next);
            if (!next.trim()) {
              setError(false);
              onChange(undefined);
              return;
            }
            try {
              onChange(JSON.parse(next));
              setError(false);
            } catch (err) {
              setError(true);
            }
          }}
        />
        {error && <Typography.Text type="danger">{formatMessage({ id: 'InvalidJson' })}</Typography.Text>}
      </Flex>
    );
  })
);

/**
 * 动作参数表单（服务端 formSchema）可用的邮件网关字段类型，注册到 FormCreator 字段 registry
 */
const createMailActionFields = formatMessage => {
  const groupName = formatMessage({ id: 'FieldTypeGroup' });
  return {
    MailLabelSelect: {
      label: formatMessage({ id: 'FieldTypeMailLabel' }),
      groupName,
      component: LabelSelectField,
      valueSchema: { type: 'array', items: { type: 'string' } }
    },
    MailTemplateSelect: {
      label: formatMessage({ id: 'FieldTypeMailTemplate' }),
      groupName,
      component: TemplateSelectField,
      valueSchema: { type: 'string' }
    },
    MailContactSelect: {
      label: formatMessage({ id: 'FieldTypeMailContacts' }),
      groupName,
      component: ContactSelectField,
      valueSchema: { type: 'array', items: { type: 'object' } }
    },
    MailEditor: {
      label: formatMessage({ id: 'FieldTypeMailEditor' }),
      groupName,
      component: createField(MailEditor),
      defaults: { block: true },
      valueSchema: { type: 'string', display: 'html' }
    },
    MailTemplateText: {
      label: formatMessage({ id: 'FieldTypeMailTemplateText' }),
      groupName,
      component: createField(TemplateTextInput),
      valueSchema: { type: 'string' }
    },
    MailJson: {
      label: formatMessage({ id: 'FieldTypeMailJson' }),
      groupName,
      component: createField(JsonInput),
      defaults: { block: true },
      valueSchema: { type: 'object', format: 'json' }
    }
  };
};

let registeredLocale = null;

export const registerMailActionFields = (preset, locale = 'zh-CN') => {
  if (registeredLocale === locale) {
    return;
  }
  registeredLocale = locale;
  preset({ locale, fields: createMailActionFields(createFormatMessage(locale)) });
};
