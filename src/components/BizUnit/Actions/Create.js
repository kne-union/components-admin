import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App } from 'antd';
import merge from 'lodash/merge';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const Create = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(withLocale(({ remoteModules, apis, onSuccess, getFormInner, data, options, ...props }) => {
  const [useFormModal, usePreset] = remoteModules;
  const formModal = useFormModal();
  const { ajax } = usePreset();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();
  return (
    <Button
      {...Object.assign({}, props, options.createButtonProps)}
      onClick={() => {
        formModal(
          merge(
            {},
            {
              title: formatMessage({ id: 'AddBiz' }, { bizName: options.bizName }),
              size: 'small',
              formProps: {
                onSubmit: async formData => {
                  const { data: resData } = await ajax(
                    typeof apis.create === 'function'
                      ? apis.create({ formData, data, options })
                      : merge({}, apis.create, {
                          data: formData
                        })
                  );
                  if (resData.code !== 0) {
                    return false;
                  }
                  message.success(formatMessage({ id: 'AddSuccess' }, { bizName: options.bizName }));
                  onSuccess && onSuccess();
                }
              },
              children: getFormInner({ apis, action: 'create', options })
            },
            options.formModalProps,
            options.createFormModalProps
          )
        );
      }}
    />
  );
}));

export default Create;
