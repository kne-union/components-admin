import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App } from 'antd';
import merge from 'lodash/merge';
import FormInner from '../FormInner';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';

const Create = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(({ remoteModules, apis, onSuccess, ...props }) => {
  const [useFormModal, usePreset] = remoteModules;
  const formModal = useFormModal();
  const { formatMessage } = useIntl();
  const { ajax } = usePreset();
  const { message } = App.useApp();
  return (
    <Button
      {...props}
      onClick={() => {
        formModal({
          title: formatMessage({ id: 'AddUser' }),
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
              message.success(formatMessage({ id: 'AddSuccess' }));
              onSuccess && onSuccess();
            }
          },
          children: <FormInner apis={apis} />
        });
      }}
    />
  );
});

export default withLocale(Create);
