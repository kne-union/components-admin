import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App } from 'antd';
import merge from 'lodash/merge';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const Create = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, apis, onSuccess, getFormInner, data, options, fetchOptions, ...props }) => {
    const [useFormModal, usePreset] = remoteModules;
    const formModal = useFormModal();
    const { ajax } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    return (
      <Button
        {...Object.assign({}, props, options.createButtonProps)}
        onClick={() => {
          const onSubmit = async formData => {
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
          };
          formModal(
            merge(
              {},
              {
                title: formatMessage({ id: 'AddBiz' }, { bizName: options.bizName }),
                size: options.formSize || 'small',
                formProps: Object.assign(
                  {},
                  {
                    onSubmit
                  },
                  typeof options.formProps === 'function'
                    ? options.formProps({
                        options,
                        onSubmit,
                        props,
                        apis,
                        onSuccess,
                        data,
                        fetchOptions,
                        action: 'create'
                      })
                    : options.formProps
                ),
                children: getFormInner({ apis, action: 'create', options })
              },
              options.formModalProps,
              options.createFormModalProps
            )
          );
        }}
      />
    );
  })
);

export default Create;
