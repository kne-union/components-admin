import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App } from 'antd';
import merge from 'lodash/merge';
import FormInner from '../FormInner';

const Create = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(({ remoteModules, apis, onSuccess, ...props }) => {
  const [useFormModal, usePreset] = remoteModules;
  const formModal = useFormModal();
  const { ajax } = usePreset();
  const { message } = App.useApp();
  return (
    <Button
      {...props}
      onClick={() => {
        formModal({
          title: '添加用户',
          size: 'small',
          formProps: {
            onSubmit: async formData => {
              const { data: resData } = await ajax(
                merge({}, apis.create, {
                  data: formData
                })
              );
              if (resData.code !== 0) {
                return false;
              }
              message.success('添加成功');
              onSuccess && onSuccess();
            }
          },
          children: <FormInner apis={apis} />
        });
      }}
    />
  );
});

export default Create;
