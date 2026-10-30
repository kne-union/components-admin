import { createWithRemoteLoader } from '@kne/remote-loader';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from '@kne/react-intl';
import Editor from '@components/Editor';
import withLocale from './withLocale';
import style from './style.module.scss';

export const TEMPLATE_VARIABLES = [
  { name: 'mail.subject', id: 'VarMailSubject' },
  { name: 'mail.from.first.name', id: 'VarMailFromName' },
  { name: 'mail.from.first.address', id: 'VarMailFromAddress' },
  { name: 'mail.date', id: 'VarMailDate' },
  { name: 'account.name', id: 'VarAccountName' },
  { name: 'account.address', id: 'VarAccountAddress' }
];

const MAIL_PRESET_MODULES = ['components-thirdparty:CKEditor@EMAIL_TOOLBAR_ITEMS', 'components-thirdparty:CKEditor@EMAIL_STYLE_DEFINITIONS'];

const TEMPLATE_TOOLBAR_ITEMS = ['insertTemplateVariable', 'insertTemplateCondition'];

export const getTemplateVariables = formatMessage => TEMPLATE_VARIABLES.map(item => ({ name: item.name, label: formatMessage({ id: item.id }) }));

const filterToolbarItems = (items, excludes) =>
  (items || [])
    .filter(item => !excludes.includes(item))
    .filter((item, index, list) => item !== '|' || (index > 0 && list[index - 1] !== '|'));

export const useMailEditorConfig = ({ toolbarItems, styleDefinitions, template = true, config }) => {
  const { formatMessage } = useIntl();
  return useMemo(
    () =>
      Object.assign(
        {
          toolbar: { items: filterToolbarItems(toolbarItems, template ? [] : TEMPLATE_TOOLBAR_ITEMS) },
          style: { definitions: styleDefinitions || [] }
        },
        template ? { templateVariable: { variables: getTemplateVariables(formatMessage) } } : {},
        config
      ),
    [formatMessage, toolbarItems, styleDefinitions, template, config]
  );
};

export const MailEditorField = createWithRemoteLoader({
  modules: MAIL_PRESET_MODULES
})(
  withLocale(({ remoteModules, template, config, ...props }) => {
    const [toolbarItems, styleDefinitions] = remoteModules;
    const mailConfig = useMailEditorConfig({ toolbarItems, styleDefinitions, template, config });
    return <Editor {...props} config={mailConfig} />;
  })
);

const TEMPLATE_TAG = /\{\{[\s\S]+?\}\}|\{%[\s\S]+?%\}/g;

const withTemplateTokens = (value, transform) => {
  const tokens = [];
  const replaced = value.replace(TEMPLATE_TAG, match => {
    tokens.push(match);
    return `\uE000TPL_${tokens.length - 1}\uE000`;
  });
  return transform(replaced).replace(/\uE000TPL_(\d+)\uE000/g, (_, index) => tokens[Number(index)] || '');
};

export const htmlToTemplateText = value => {
  if (typeof value !== 'string' || !value) {
    return '';
  }
  return withTemplateTokens(value, text =>
    text
      .replace(/<\/(p|div|li)>|<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim()
  );
};

export const templateTextToEditorHtml = value => {
  if (typeof value !== 'string' || !value) {
    return '';
  }
  return `<p>${withTemplateTokens(value, text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))}</p>`;
};

// 单行文本（如主题）只允许行内条件，块级条件转成纯文本后无法识别
const TEMPLATE_TEXT_CONFIG = {
  toolbar: { items: ['undo', 'redo', '|', 'insertTemplateVariable', 'insertTemplateCondition', '|', 'sourceEditing'] },
  templateCondition: { allowBlock: false }
};

const MailEditor = createWithRemoteLoader({
  modules: ['components-thirdparty:CKEditor', 'components-core:Global@usePreset', ...MAIL_PRESET_MODULES]
})(
  withLocale(({ remoteModules, template, config, ...props }) => {
    const [CKEditor, usePreset, toolbarItems, styleDefinitions] = remoteModules;
    const { apis } = usePreset();
    const mailConfig = useMailEditorConfig({ toolbarItems, styleDefinitions, template, config });
    const uploadAdapter = useMemo(() => ({ upload: apis?.file?.uploadForEditor }), [apis?.file?.uploadForEditor]);
    return <CKEditor.Field {...props} uploadAdapter={uploadAdapter} config={mailConfig} />;
  })
);

export const TemplateTextInput = ({ value, onChange }) => {
  const [html, setHtml] = useState(() => templateTextToEditorHtml(value));
  const textRef = useRef(value || '');
  useEffect(() => {
    if ((value || '') !== textRef.current) {
      textRef.current = value || '';
      setHtml(templateTextToEditorHtml(value));
    }
  }, [value]);
  return (
    <div className={style['template-text-input']}>
      <MailEditor
        value={html}
        config={TEMPLATE_TEXT_CONFIG}
        onChange={next => {
          setHtml(next);
          textRef.current = htmlToTemplateText(next);
          onChange(textRef.current);
        }}
      />
    </div>
  );
};

export default MailEditor;
