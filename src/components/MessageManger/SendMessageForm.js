import { createWithRemoteLoader } from '@kne/remote-loader';
import { useEffect, useMemo, useState } from 'react';
import { Alert, App, Flex, Segmented, Skeleton, Spin, Tag, Typography } from 'antd';
import { useIntl } from '@kne/react-intl';
import { useIsMobile } from '@kne/responsive-utils';
import withLocale from './withLocale';
import { MessageView } from './DetailContent';
import style from './style.module.scss';
import {
  buildSendPreviewProps,
  getInvalidRecipients,
  getMissingVariables,
  getVariableFieldName,
  parseJSON,
  parseRecipients,
  safeBuildMessageProps,
  splitMessageProps
} from './utils';

export const MAX_RECIPIENTS = 50;

const PREVIEW_DELAY = 400;

/** 单个收件人校验：必填、格式 */
export const createRecipientRule =
  ({ isSMS, formatMessage }) =>
  value => {
    const recipient = String(value || '').trim();    if (!recipient) {
      return { result: false, errMsg: formatMessage({ id: 'RecipientsRequired' }) };
    }
    if (getInvalidRecipients([recipient], isSMS).length > 0) {
      return { result: false, errMsg: formatMessage({ id: isSMS ? 'PhoneInvalid' : 'EmailInvalid' }, { list: recipient }) };
    }
    return { result: true, errMsg: '' };
  };

/** 按当前填写内容实时渲染，与实际发送结果一致 */
const LivePreview = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:FormInfo']
})(({ remoteModules, template, variables, requiredNames }) => {
  const [usePreset, FormInfo] = remoteModules;
  const { apis, ajax } = usePreset();
  const { formData } = FormInfo.useFormContext();
  const { formatMessage } = useIntl();
  const recipientCount = parseRecipients(formData?.recipients).length;
  const previewKey = JSON.stringify(buildSendPreviewProps(formData || {}, variables, requiredNames));
  const missing = getMissingVariables(safeBuildMessageProps(formData || {}, variables), variables, requiredNames);
  const [state, setState] = useState({ loading: true, data: null });

  useEffect(() => {
    let canceled = false;
    setState(current => Object.assign({}, current, { loading: true }));
    const timer = setTimeout(async () => {
      const { data: resData } = await ajax(
        Object.assign({}, apis.messageManger.templates.render, { data: { templateId: String(template.id), props: JSON.parse(previewKey) } })
      );
      if (!canceled) {
        setState(current => ({ loading: false, data: resData?.code === 0 ? resData.data : current.data }));
      }
    }, PREVIEW_DELAY);
    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [ajax, apis, template.id, previewKey]);

  const { loading, data } = state;

  return (
    <div className={style['send-preview']}>
      <Flex justify="space-between" align="center" wrap gap={8}>
        <Flex align="center" gap={8}>
          <span className={style['send-section-title']}>{formatMessage({ id: 'SendPreview' })}</span>
          {loading && <Spin size="small" />}
        </Flex>
        <Tag bordered={false} color={recipientCount > 0 ? 'processing' : 'default'}>
          {formatMessage({ id: 'RecipientCount' }, { count: recipientCount })}
        </Tag>
      </Flex>
      {missing.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message={formatMessage({ id: 'MissingVariablesTips' }, { list: missing.map(item => item.label || item.name).join('、') })}
        />
      )}
      {data ? <MessageView type={data.type} subject={data.subject} html={data.html} text={data.text} /> : <Skeleton active />}
    </div>
  );
});

/**
 * 按模板发送：左侧填写收件人与变量，右侧实时预览；移动端上下排列
 * 使用 Modal 的 ColumnsLayout 分栏，需放在 bodyScroll={false} 的 FormModal 内
 */
const SendMessageForm = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-thirdparty:JSONEditor', 'components-core:Modal@ColumnsLayout', 'components-core:Modal@ScrollRegion']
})(
  withLocale(({ remoteModules, template, variables = [], requiredNames = [] }) => {
    const [FormInfo, JSONEditor, ColumnsLayout, ScrollRegion] = remoteModules;
    const { MultiField } = FormInfo;
    const { Input } = FormInfo.fields;
    const { formatMessage } = useIntl();
    const isMobile = useIsMobile();
    const isSMS = Number(template.type) === 1;
    const recipientRule = useMemo(() => createRecipientRule({ isSMS, formatMessage }), [isSMS, formatMessage]);
    const recipientLabel = formatMessage({ id: isSMS ? 'PhoneRecipients' : 'EmailRecipients' });

    const { openApi, formData } = FormInfo.useFormContext();
    const { message } = App.useApp();
    const [mode, setMode] = useState('form');
    const isJSONMode = variables.length === 0 || mode === 'json';

    // 切换时整体同步，同一变量只保留一个来源：JSON 模式只看 JSON；表单模式变量只看输入框，JSON 只留额外参数
    const handleModeChange = nextMode => {
      if (nextMode === 'json') {
        const merged = safeBuildMessageProps(formData || {}, variables);
        openApi.setFields(
          [
            { name: 'props', value: JSON.stringify(merged, null, 2) },
            ...variables.map((item, index) => ({ name: getVariableFieldName(index), value: '' }))
          ],
          { runValidate: false }
        );
      } else {
        let parsed;
        try {
          parsed = parseJSON(formData?.props);
        } catch {
          parsed = null;
        }
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          message.error(formatMessage({ id: 'PropsInvalid' }));
          return;
        }
        const { fields, restProps } = splitMessageProps(variables, parsed);
        openApi.setFields(
          [
            { name: 'props', value: JSON.stringify(restProps, null, 2) },
            ...Object.entries(fields).map(([name, value]) => ({ name, value }))
          ],
          { runValidate: false }
        );
      }
      setMode(nextMode);
    };

    const modeSwitch =
      variables.length > 0 ? (
        <Segmented
          size="small"
          value={mode}
          onChange={handleModeChange}
          options={[
            { label: formatMessage({ id: 'FillByForm' }), value: 'form' },
            { label: 'JSON', value: 'json' }
          ]}
        />
      ) : null;

    // 变量输入框按原始下标命名，与 buildMessageProps 的取值保持一致
    const renderVariableInputs = list =>
      list.map(({ item, index }) => (
        <Input
          key={item.name}
          name={getVariableFieldName(index)}
          label={item.label || item.name}
          tips={`{{ ${item.name} }}`}
          placeholder={item.example ? String(item.example) : undefined}
        />
      ));
    const indexed = variables.map((item, index) => ({ item, index }));
    const requiredList = indexed.filter(({ item }) => requiredNames.includes(item.name));
    const optionalList = indexed.filter(({ item }) => !requiredNames.includes(item.name));
    const column = isMobile ? 1 : 2;

    const form = (
      <>
        <FormInfo
          title={recipientLabel}
          extra={<Typography.Text type="secondary">{formatMessage({ id: 'RecipientsTips' }, { max: MAX_RECIPIENTS })}</Typography.Text>}
          column={1}
          list={[
            <MultiField
              name="recipients"
              label={recipientLabel}
              field={Input}
              rule={recipientRule}
              minLength={1}
              maxLength={MAX_RECIPIENTS}
              placeholder={formatMessage({ id: isSMS ? 'PhonePlaceholder' : 'EmailPlaceholder' })}
            />
          ]}
        />
        {/* 两种模式的字段都保持挂载，只切换显示，避免卸载时丢值 */}
        <div style={isJSONMode ? { display: 'none' } : undefined}>
          {requiredList.length > 0 && (
            <FormInfo
              title={formatMessage({ id: 'RequiredVariables' })}
              extra={modeSwitch}
              column={column}
              list={renderVariableInputs(requiredList)}
            />
          )}
          {optionalList.length > 0 && (
            <FormInfo
              title={formatMessage({ id: 'OptionalVariables' })}
              extra={
                <Flex align="center" gap={12}>
                  <Typography.Text type="secondary">{formatMessage({ id: 'OptionalVariablesTips' })}</Typography.Text>
                  {requiredList.length === 0 && modeSwitch}
                </Flex>
              }
              column={column}
              list={renderVariableInputs(optionalList)}
            />
          )}
        </div>
        <div style={isJSONMode ? undefined : { display: 'none' }}>
          <FormInfo
            title={formatMessage({ id: 'PropsJSON' })}
            extra={modeSwitch}
            column={1}
            list={[
              <JSONEditor
                name="props"
                label={formatMessage({ id: 'PropsJSON' })}
                labelHidden
                placeholder={formatMessage({ id: 'PropsPlaceholder' })}
              />
            ]}
          />
          {variables.length > 0 && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {formatMessage({ id: 'PropsJSONTips' })}
            </Typography.Text>
          )}
        </div>
      </>
    );

    const preview = <LivePreview template={template} variables={variables} requiredNames={requiredNames} />;

    if (isMobile) {
      return (
        <ScrollRegion inset>
          <Flex vertical gap={16}>
            {form}
            {preview}
          </Flex>
        </ScrollRegion>
      );
    }

    return (
      <ColumnsLayout widths={['1fr', '1fr']}>
        <ScrollRegion inset>{form}</ScrollRegion>
        <ScrollRegion inset>{preview}</ScrollRegion>
      </ColumnsLayout>
    );
  })
);

export default SendMessageForm;
