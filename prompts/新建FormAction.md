帮我生成一个[业务模块名称]的action，生成要求如下：

1. 根据 [业务模块名称] 取一个大写字母开头的英文名称
2. 将文件名改为 [英文名称].js
3. 将组件名称 "业务组件名称" 改为 [英文名称]
4. 将表单标题 "[业务模块名称]" 改为实际的 [业务模块名称]
5. 将成功提示 "[操作][业务模块名称]成功" 改为 "操作[业务模块名称]成功"
6. 保持其他代码结构和逻辑不变
7. 输出到当前目录

* 请注意，如果[业务模块名称]中包含中文，请将中文转换为英文,驼峰命名

* 以下是代码模版

```jsx
import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App } from 'antd';

const [业务组件名称] = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(({ remoteModules, onSuccess, data, options, getFormInner, ...props }) => {
  const [useFormModal, usePreset] = remoteModules;
  const formModal = useFormModal();
  const { ajax } = usePreset();
  const { message } = App.useApp();

  return (
    <Button
      {...props}
      onClick={() => {
        formModal({
          title: '[业务模块名称]',
          size: 'small',
          formProps: {
            data: Object.assign({}, data),
            onSubmit: async formData => {
              const { data: resData } = await ajax(
                Object.assign(
                  {},
                  {
                    data: Object.assign({}, formData, { id: data.id })
                  }
                )
              );
              if (resData.code !== 0) {
                return false;
              }
              message.success('[操作][业务模块名称]成功');
              onSuccess && onSuccess();
            }
          }
        });
      }}
    />
  );
});

export default [业务组件名称];
```

示例：
- 如果业务模块名称是"角色设置"，英文名称可以是"RoleConfig"
- 如果业务模块名称是"用户管理"，英文名称可以是"UserManage"

请基于以下信息生成新的action组件: