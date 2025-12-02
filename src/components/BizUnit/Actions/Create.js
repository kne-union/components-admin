import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App } from 'antd';
import merge from 'lodash/merge';

const Create = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(({ remoteModules, apis, onSuccess, getFormInner, data, options, ...props }) => {
  const [useFormModal, usePreset] = remoteModules;
  const formModal = useFormModal();
  const { ajax } = usePreset();
  const { message } = App.useApp();
  return (
    <Button
      {...Object.assign({}, props, options.createButtonProps)}
      onClick={() => {
        formModal(
          merge(
            {},
            {
              title: `添加${options.bizName}`,
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
                  message.success(`添加${options.bizName}成功`);
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
});

export default Create;
