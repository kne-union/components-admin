import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App } from 'antd';
import merge from 'lodash/merge';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const Edit = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(withLocale(({ remoteModules, apis, onSuccess, data, options, getFormInner, ...props }) => {
  const [useFormModal, usePreset] = remoteModules;
  const formModal = useFormModal();
  const { ajax } = usePreset();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();
  return (
    <Button
      {...Object.assign({}, props, options.editButtonProps)}
      onClick={() => {
        formModal(
          merge(
            {},
            {
              title: formatMessage({ id: 'EditBiz' }, { bizName: options.bizName }),
              size: 'small',
              formProps: {
                data: Object.assign({}, data),
                onSubmit: async formData => {
                  const { data: resData } = await ajax(
                    typeof apis.save === 'function'
                      ? apis.save({ formData, data, options })
                      : merge({}, apis.save, {
                          data: Object.assign({}, formData, { id: data.id })
                        })
                  );

                  if (resData.code !== 0) {
                    return false;
                  }

                  message.success(formatMessage({ id: 'SaveSuccess' }, { bizName: options.bizName }));
                  onSuccess && onSuccess();
                }
              },
              children: getFormInner({ apis, action: 'edit', options })
            },
            options.formModalProps,
            options.editFormModalProps
          )
        );
      }}
    />
  );
}));

export default Edit;
