import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';

const GroupSelect = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(({
  remoteModules,
  name,
  label,
  rule,
  apis,
  valueKey = 'code',
  labelKey = 'name',
  single,
  placeholder,
  disabled,
  groupName = '标签',
  ...props
}) => {
  const [FormInfo, useFormModal, usePreset] = remoteModules;
  const { fields } = FormInfo;
  const { SuperSelectTableList } = fields;
  const { ajax, apis: presetApis } = usePreset();
  const { message, modal } = App.useApp();
  const formModal = useFormModal();

  const handleDelete = async (item, { fetchApi, value, setValue }) => {
    try {
      const { data: resData } = await ajax(
        Object.assign({}, apis?.remove || presetApis?.group?.remove, {
          data: { id: item.id, code: item.code }
        })
      );

      if (resData.code !== 0) {
        return;
      }

      message.success(`删除${groupName}成功`);
      fetchApi.reload();

      // 如果删除的项目在已选值中，从已选值中移除
      if (value && value.length > 0 && value.find(target => item[valueKey] === target[valueKey])) {
        const index = value.findIndex(target => item[valueKey] === target[valueKey]);
        const newValue = value.slice(0);
        newValue.splice(index, 1);
        setValue(newValue);
      }
    } catch (error) {
      message.error(`删除${groupName}失败`);
    }
  };

  const handleAdd = ({ reload }) => {
    formModal({
      title: `添加${groupName}`,
      size: 'small',
      formProps: {
        onSubmit: async formData => {
          const { data: resData } = await ajax(
            Object.assign({}, apis?.create || presetApis?.group?.create, {
              data: formData
            })
          );
          if (resData.code !== 0) {
            return false;
          }
          message.success(`添加${groupName}成功`);
          reload();
        }
      },
      children: (
        <FormInfo
          column={1}
          list={[
            <FormInfo.fields.Input name="code" label="编码" rule="REQ" placeholder="请输入唯一编码" />,
            <FormInfo.fields.Input name="name" label="名称" rule="REQ" placeholder={`请输入${groupName}名称`} />,
            <FormInfo.fields.TextArea name="description" label="描述" placeholder={`请输入${groupName}描述`} />
          ]}
        />
      )
    });
  };

  const hasApis = apis !== undefined;
  const showAdd = hasApis ? !!apis?.create : !!presetApis?.group?.create;
  const showDelete = hasApis ? !!apis?.remove : !!presetApis?.group?.remove;

  const columns = [
    { title: '编码', name: 'code', span: 4 },
    { title: '名称', name: 'name', span: 6 },
    { title: '描述', name: 'description', span: showDelete ? 10 : 14 }
  ];

  if (showDelete) {
    columns.push({
      title: '操作',
      name: 'options',
      span: 4,
      getValueOf: (item, { context }) => {
        const { fetchApi, value, setValue } = context;
        return (
          <span onClick={e => e.stopPropagation()}>
            <a
              onClick={() => {
                modal.confirm({
                  title: '确认删除',
                  content: `确定要删除${groupName}"${item.name}"吗？`,
                  okText: '确定',
                  cancelText: '取消',
                  onOk: () => handleDelete(item, { fetchApi, value, setValue })
                });
              }}>
              删除
            </a>
          </span>
        );
      }
    });
  }

  return (
    <SuperSelectTableList
      name={name}
      label={label}
      rule={rule}
      placeholder={placeholder}
      disabled={disabled}
      single={single}
      valueKey={valueKey}
      labelKey={labelKey}
      api={apis?.list || presetApis?.group?.list}
      getSearchProps={({ searchText }) => ({
        filter: { keyword: searchText }
      })}
      pagination={{ paramsType: 'params' }}
      columns={columns}
      isPopup={false}
      footer={showAdd ? ({ reload }) => <Button type="link" onClick={() => handleAdd({ reload })}>{`添加${groupName}`}</Button> : null}
      {...props}
    />
  );
});

export default GroupSelect;
