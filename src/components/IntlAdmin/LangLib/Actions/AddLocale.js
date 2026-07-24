import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App } from 'antd';
import merge from 'lodash/merge';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';
import { normalizeLocales, getTargetFieldName } from '../FormInner';
import { resolveNamespaceCode } from '../../syncNamespacesToGroup';

const buildCreatePayload = formData => {
  const { aiGenerate, locale, namespace, code, sourceTarget, defaultLocale } = formData;
  const locales = normalizeLocales(locale).map(item => item.value);
  const payload = {
    namespace: resolveNamespaceCode(namespace) || namespace,
    code,
    locales,
    aiGenerate: !!aiGenerate
  };
  if (aiGenerate) {
    const sourceText = sourceTarget != null ? String(sourceTarget) : '';
    // 所选语言全部为默认语言：直接添加，不走 AI
    const onlyDefault =
      defaultLocale && locales.length > 0 && locales.every(item => item === defaultLocale);
    if (onlyDefault) {
      payload.aiGenerate = false;
      payload.targets = { [defaultLocale]: sourceText };
      return payload;
    }
    payload.sourceTarget = sourceText;
    if (defaultLocale) {
      payload.defaultLocale = defaultLocale;
    }
  } else {
    const targets = {};
    locales.forEach(localeCode => {
      const fieldName = getTargetFieldName(localeCode);
      if (formData[fieldName] != null) {
        targets[localeCode] = formData[fieldName];
      }
    });
    payload.targets = targets;
  }
  return payload;
};

const AddLocale = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, data, onSuccess, apis, options, getFormInner, fetchOptions, existingLocales = [], ...props }) => {
    const [useFormModal, usePreset] = remoteModules;
    const formModal = useFormModal();
    const { ajax } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();

    return (
      <Button
        {...props}
        onClick={() => {
          const onSubmit = async formData => {
            const { data: resData } = await ajax(
              typeof apis.create === 'function'
                ? apis.create({ formData, data, options })
                : merge({}, apis.create, {
                    data: buildCreatePayload(formData)
                  })
            );
            if (resData.code !== 0) {
              return false;
            }
            message.success(formatMessage({ id: 'AddSuccess' }, { bizName: options.bizName }));
            onSuccess && onSuccess();
          };
          formModal({
            title: formatMessage({ id: 'AddLocale' }),
            size: options.formSize || 'small',
            formProps: {
              data: {
                namespace: data.namespace,
                code: data.code
              },
              onSubmit
            },
            children: getFormInner({
              apis,
              action: 'addLocale',
              options,
              existingLocales,
              data
            })
          });
        }}
      />
    );
  })
);

export default AddLocale;
export { buildCreatePayload };
