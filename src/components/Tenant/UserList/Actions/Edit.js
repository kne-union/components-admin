import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App } from 'antd';
import FormInner from '../FormInner';
import merge from 'lodash/merge';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';

const Edit = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(withLocale(({ remoteModules, apis, onSuccess, data, ...props }) => {
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
          title: formatMessage({ id: 'EditUser' }),
          size: 'small',
          formProps: {
            data: Object.assign({}, data, {
              tenantOrgId: data.tenantOrg
                ? {
                    id: data.tenantOrg.id,
                    name: data.tenantOrg.name
                  }
                : null
            }),
            onSubmit: async formData => {
              const { data: resData } = await ajax(
                merge({}, apis.save, {
                  data: Object.assign({}, formData, { id: data.id })
                })
              );

              if (resData.code !== 0) {
                return false;
              }

              message.success(formatMessage({ id: 'SaveSuccess' }));
              onSuccess && onSuccess();
            }
          },
          children: <FormInner apis={apis} />
        });
      }}
    />
  );
}));

export default Edit;
