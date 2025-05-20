import { createWithRemoteLoader } from '@kne/remote-loader';
import UserInfoFormInner from './UserInfoFormInner';
import { App } from 'antd';

const SaveUserInfo = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset', 'components-core:Global@useGlobalContext']
})(({ remoteModules, children }) => {
  const [useFormModal, usePreset, useGlobalContext] = remoteModules;
  const formModal = useFormModal();
  const { global } = useGlobalContext('userInfo');
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();
  return children({
    onClick: () => {
      const modalApi = formModal({
        title: '编辑个人基本信息',
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
            message.success('保存成功');
            global.reload();
            modalApi.close();
          }
        },
        children: <UserInfoFormInner column={1} />
      });
    }
  });
});

export default SaveUserInfo;
