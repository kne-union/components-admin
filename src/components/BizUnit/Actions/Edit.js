import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App } from 'antd';
import merge from 'lodash/merge';

const Edit = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(({ remoteModules, apis, onSuccess, data, options, getFormInner, ...props }) => {
  const [useFormModal, usePreset] = remoteModules;
  const formModal = useFormModal();
  const { ajax } = usePreset();
  const { message } = App.useApp();
  return (
    <Button
      {...Object.assign({}, props, options.editButtonProps)}
      onClick={() => {
        formModal(
          merge(
            {},
            {
              title: `编辑${options.bizName}`,
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

                  message.success(`保存${options.bizName}成功`);
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
});

export default Edit;
