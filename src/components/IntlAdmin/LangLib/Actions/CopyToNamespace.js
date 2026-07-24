import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';
import { requestCopyToNamespace } from './reviewHelpers';
import { INTL_NAMESPACE_TYPE } from '../../constants';
import { resolveNamespaceCode, toNamespaceFieldValue } from '../../syncNamespacesToGroup';

const CopyToNamespace = createWithRemoteLoader({
  modules: [
    'components-core:FormInfo@useFormModal',
    'components-core:FormInfo',
    'components-core:Global@usePreset',
    'components-admin:GroupSelect'
  ]
})(
  withLocale(({ remoteModules, data, ids, onSuccess, apis, options, GroupSelect: GroupSelectProp, ...props }) => {
    const [useFormModal, FormInfo, usePreset, GroupSelectRemote] = remoteModules;
    const GroupSelect = GroupSelectProp || GroupSelectRemote;
    const formModal = useFormModal();
    const { ajax } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    const idList = Array.isArray(ids) && ids.length > 0 ? ids : data?.id ? [data.id] : [];

    return (
      <Button
        {...props}
        onClick={() => {
          if (idList.length === 0) {
            message.warning(formatMessage({ id: 'BatchCopyNamespaceEmpty' }));
            return;
          }
          formModal({
            title: formatMessage({ id: 'CopyToNamespace' }),
            size: 'small',
            formProps: {
              onSubmit: async formData => {
                const namespace = resolveNamespaceCode(formData.namespace);
                if (!namespace) {
                  return false;
                }
                const resData = await requestCopyToNamespace({
                  ajax,
                  apis,
                  ids: idList,
                  namespace
                });
                if (resData.code !== 0) {
                  return false;
                }
                const createdCount = resData?.data?.createdCount ?? idList.length;
                message.success(formatMessage({ id: 'CopyToNamespaceSuccess' }, { count: createdCount }));
                onSuccess && onSuccess();
              }
            },
            children: (
              <FormInfo
                column={1}
                list={[
                  <GroupSelect
                    name="namespace"
                    label={formatMessage({ id: 'Namespace' })}
                    rule="REQ"
                    single
                    type={INTL_NAMESPACE_TYPE}
                    groupName={formatMessage({ id: 'Namespace' })}
                    showParent={false}
                    valueKey="code"
                    labelKey="name"
                    placeholder={formatMessage({ id: 'TargetNamespacePlaceholder' })}
                    interceptor={{
                      input: value => toNamespaceFieldValue(value),
                      output: value => resolveNamespaceCode(value)
                    }}
                  />
                ]}
              />
            )
          });
        }}
      />
    );
  })
);

export default CopyToNamespace;
