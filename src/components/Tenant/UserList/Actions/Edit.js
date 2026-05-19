import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App } from 'antd';
import FormInner from '../FormInner';
import merge from 'lodash/merge';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';
import { mapUserOrgIdsToFormValue, pickTenantOrgIdsFromForm } from '../pickTenantOrgIdsFromForm';
import { extractPositionPageData, mapUserOptionsToFormValue } from '../mapUserOptionsToFormValue';

const loadPositionList = async (ajax, positionListApi) => {
  if (!positionListApi?.url) {
    return [];
  }
  try {
    const response = await ajax(merge({}, positionListApi));
    return extractPositionPageData(response);
  } catch {
    return [];
  }
};

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
      onClick={async () => {
        const positionList = await loadPositionList(ajax, apis.positionList);
        formModal({
          title: formatMessage({ id: 'EditUser' }),
          size: 'small',
          formProps: {
            data: Object.assign({}, data, {
              tenantOrgIds: mapUserOrgIdsToFormValue(data),
              options: mapUserOptionsToFormValue(data.options, { positionList })
            }),
            onSubmit: async formData => {
              const tenantOrgIds = pickTenantOrgIdsFromForm(formData.tenantOrgIds);
              const position = formData.options?.position;
              const { data: resData } = await ajax(
                merge({}, apis.save, {
                  data: Object.assign({}, formData, {
                    id: data.id,
                    tenantOrgIds,
                    tenantOrgId: tenantOrgIds[0] || null,
                    options: Object.assign({}, formData.options, {
                      position: position && typeof position === 'object' ? position.id : position
                    })
                  })
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
