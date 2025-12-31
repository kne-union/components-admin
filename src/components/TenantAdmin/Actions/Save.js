import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import FormInner from '../FormInner';

const SaveInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(({ remoteModules, data, onSuccess, ...props }) => {
  const [useFormModal, usePreset] = remoteModules;
  const formModal = useFormModal();
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();

  return (
    <Button
      {...props}
      onClick={() => {
        formModal({
          title: formatMessage({ id: 'EditTenant' }),
          size: 'small',
          formProps: {
            data: Object.assign({}, data, {
              serviceTime: [data.serviceStartTime, data.serviceEndTime]
            }),
            onSubmit: async formData => {
              const { data: resData } = await ajax(
                Object.assign({}, apis.tenantAdmin.save, {
                  data: Object.assign(
                    {},
                    formData,
                    {
                      serviceStartTime: formData.serviceTime[0],
                      serviceEndTime: formData.serviceTime[1]
                    },
                    { id: data.id }
                  )
                })
              );
              if (resData.code !== 0) {
                return false;
              }
              message.success(formatMessage({ id: 'SaveSuccess' }));
              onSuccess && onSuccess();
            }
          },
          children: <FormInner />
        });
      }}
    />
  );
});

export default withLocale(SaveInner);
