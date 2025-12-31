import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import UserInfoFormInner from './UserInfoFormInner';
import { App } from 'antd';

const SaveUserInfoInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset', 'components-core:Global@useGlobalContext']
})(({ remoteModules, children }) => {
  const [useFormModal, usePreset, useGlobalContext] = remoteModules;
  const formModal = useFormModal();
  const { global } = useGlobalContext('userInfo');
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();
  return children({
    onClick: () => {
      const modalApi = formModal({
        title: formatMessage({ id: 'EditUserInfo' }),
        size: 'small',
        formProps: {
          data: global.value,
          onSubmit: async data => {
            const { data: resData } = await ajax(
              Object.assign({}, apis.user.saveUserInfo, {
                data
              })
            );
            if (resData.code !== 0) {
              return;
            }
            message.success(formatMessage({ id: 'SaveSuccess' }));
            global.reload();
            modalApi.close();
          }
        },
        children: <UserInfoFormInner column={1} />
      });
    }
  });
});

export default withLocale(SaveUserInfoInner);
