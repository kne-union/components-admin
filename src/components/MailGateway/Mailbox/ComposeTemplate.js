import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import style from '../style.module.scss';
import '@kne/super-select/dist/index.css';

/**
 * 写信弹窗内的模版选择：FormInfo 字段，SuperSelect 搜索/分页；样式依赖 super-select CSS。
 */
const ComposeTemplate = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset', 'components-core:Modal@useConfirmModal']
})(
  withLocale(({ remoteModules, mailId, quoteHtml, onApply, value, onChange, className, ...props }) => {
    const [FormInfo, usePreset, useConfirmModal] = remoteModules;
    // 外层 Field 已 useOnChange，这里用 SuperSelect.Field 避免双重绑定
    const SuperSelect = FormInfo.fields.SuperSelect.Field || FormInfo.fields.SuperSelect;
    const { openApi } = FormInfo.useFormContext();
    const { ajax, apis } = usePreset();
    const { message } = App.useApp();
    const confirmModal = useConfirmModal();
    const { formatMessage } = useIntl();
    const [loading, setLoading] = useState(false);

    const toId = next => {
      if (next == null || next === '') {
        return undefined;
      }
      return typeof next === 'object' ? (next.value ?? next.id) : next;
    };

    // SuperSelect 展示依赖 value 上的 label；只回写 id 会导致选框变白
    const toOption = next => {
      if (next == null || next === '') {
        return undefined;
      }
      if (typeof next === 'object') {
        return next;
      }
      return { value: next, label: String(next) };
    };

    const applyTemplate = async option => {
      const templateId = toId(option);
      if (!templateId) {
        return;
      }
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
      onChange && onChange(toOption(option));
      onApply && onApply();
      message.success(formatMessage({ id: 'TemplateApplied' }));
    };

    const handleChange = next => {
      const option = toOption(next);
      const templateId = toId(option);
      if (!templateId) {
        onChange && onChange(undefined);
        return;
      }
      const formData = openApi.getFormData();
      const current = String(formData.html || '').trim();
      if (current && current !== String(quoteHtml || '').trim()) {
        confirmModal({
          title: formatMessage({ id: 'UseTemplate' }),
          message: formatMessage({ id: 'ConfirmOverwriteContent' }),
          onConfirm: () => applyTemplate(option)
        });
        return;
      }
      return applyTemplate(option);
    };

    const baseFilter = { status: 'enabled' };

    return (
      <SuperSelect
        {...props}
        single
        allowClear
        isPopup
        disabled={loading}
        className={[style['compose-template-select'], className].filter(Boolean).join(' ')}
        placeholder={formatMessage({ id: 'UseTemplatePlaceholder' })}
        pagination={{ paramsType: 'params' }}
        getSearchProps={({ searchText }) => ({
          filter: Object.assign({}, baseFilter, searchText ? { keyword: searchText } : null)
        })}
        api={Object.assign({}, apis.mailGateway.template.list, {
          params: { filter: baseFilter },
          transformData: data =>
            Object.assign({}, data, {
              pageData: (data.pageData || []).map(item =>
                Object.assign({}, item, {
                  value: item.id,
                  label: item.category?.name ? `${item.category.name} / ${item.name}` : item.name
                })
              )
            })
        })}
        value={value}
        onChange={handleChange}
      />
    );
  })
);

const ComposeTemplateField = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules, ...props }) => {
  const [FormInfo] = remoteModules;
  const render = FormInfo.hooks.useOnChange(props);
  return render(ComposeTemplate);
});

export default ComposeTemplateField;
export { ComposeTemplate };
