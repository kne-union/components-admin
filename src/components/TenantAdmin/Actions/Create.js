import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';
import FormInner from '../FormInner';

const Create = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(({ remoteModules, onSuccess, ...props }) => {
  const [useFormModal, usePreset] = remoteModules;
  const formModal = useFormModal();
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();

  return (
    <Button
      {...props}
      onClick={() => {
        formModal({
          title: '添加租户',
          size: 'small',
          formProps: {
            onSubmit: async formData => {
              const { data: resData } = await ajax(
                Object.assign({}, apis.tenantAdmin.create, {
                  data: Object.assign({}, formData, {
                    serviceStartTime: formData.serviceTime[0],
                    serviceEndTime: formData.serviceTime[1]
                  })
                })
              );
              if (resData.code !== 0) {
                return false;
              }
              message.success('添加成功');
              onSuccess && onSuccess();
            }
          },
          children: <FormInner />
        });
      }}
    />
  );
});

export default Create;
