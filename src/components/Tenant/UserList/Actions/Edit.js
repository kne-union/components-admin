import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App } from 'antd';
import FormInner from '../FormInner';
import merge from 'lodash/merge';
import get from 'lodash/get';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';
import { mapUserOrgIdsToFormValue } from '../transformUserFormData';
import transformUserFormData from '../transformUserFormData';

const Edit = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(withLocale(({ remoteModules, apis, onSuccess, data, ...props }) => {
  const [useFormModal, usePreset] = remoteModules;
  const formModal = useFormModal();
  const { formatMessage } = useIntl();
  const { ajax, plugins } = usePreset();
  const { message } = App.useApp();

  const enhanceData = async (item) => {
    const enhanceUserData = get(plugins, 'tenantAdmin.enhanceUserData');
    if (typeof enhanceUserData !== 'function') {
      return item;
    }
    return enhanceUserData(item, { apis, ajax });
  };

  return (
    <Button
      {...props}
      onClick={async () => {
        const enhancedData = await enhanceData(data);
        formModal({
          title: formatMessage({ id: 'EditUser' }),
          size: 'small',
          formProps: {
            data: Object.assign({}, enhancedData, {
              tenantOrgIds: mapUserOrgIdsToFormValue(enhancedData)
            }),
            onSubmit: async formData => {
              const { data: resData } = await ajax(
                merge({}, apis.save, {
                  data: transformUserFormData(formData, enhancedData)
                })
              );

              if (resData.code !== 0) {
                return false;
              }

              message.success(formatMessage({ id: 'SaveSuccess' }));
              onSuccess && onSuccess();
            }
          },
          children: <FormInner apis={apis} data={data} />
        });
      }}
    />
  );
}));

export default Edit;
