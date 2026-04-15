import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';
import merge from 'lodash/merge';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import style from './style.module.scss';

const createComponent = (callback = item => item) => {
  return createWithRemoteLoader({
    modules: [
      'components-core:FormInfo',
      'components-core:FormInfo@useFormModal',
      'components-core:Global@usePreset',
      'components-core:Global@useGlobalValue'
    ]
  })(
    withLocale(({
      remoteModules,
      name,
      label,
      type,
      language: propsLanguage,
      rule,
      apis,
      valueKey = 'code',
      labelKey = 'name',
      single,
      placeholder,
      disabled,
      groupName: propsGroupName,
      ...props
    }) => {
      const { formatMessage } = useIntl();
      const groupName = propsGroupName || formatMessage({ id: 'GroupSelectDefaultName' });
      const [FormInfo, useFormModal, usePreset, useGlobalValue] = remoteModules;
      const { fields } = FormInfo;
      const { SuperSelectTableList, SuperSelectTree } = fields;
      const { ajax, apis: presetApis } = usePreset();
      const { message, modal } = App.useApp();
      const formModal = useFormModal();
      const locale = useGlobalValue('locale');

      const language = propsLanguage || locale || 'zh-CN';

      const handleDelete = async (item, { fetchApi, value, setValue }) => {
        try {
          const { data: resData } = await ajax(
            Object.assign({}, apis?.remove || presetApis?.group?.remove, {
              data: { id: item.id, code: item.code, type }
            })
          );

          if (resData.code !== 0) {
            return;
          }

          message.success(formatMessage({ id: 'GroupSelectDeleteSuccess' }));
          fetchApi.reload();

          // 如果删除的项目在已选值中，从已选值中移除
          if (value && value.length > 0 && value.find(target => item[valueKey] === target[valueKey])) {
            const index = value.findIndex(target => item[valueKey] === target[valueKey]);
            const newValue = value.slice(0);
            newValue.splice(index, 1);
            setValue(newValue);
          }
        } catch (error) {
          message.error(formatMessage({ id: 'GroupSelectDeleteFailed' }));
        }
      };

      const handleAdd = ({ reload }) => {
        formModal({
          title: formatMessage({ id: 'GroupSelectAdd' }, { name: groupName }),
          size: 'small',
          formProps: {
            onSubmit: async formData => {
              const { data: resData } = await ajax(
                Object.assign({}, apis?.create || presetApis?.group?.create, {
                  data: Object.assign({}, formData, { type, language })
                })
              );
              if (resData.code !== 0) {
                return false;
              }
              message.success(formatMessage({ id: 'GroupSelectAddSuccess' }));
              reload();
            }
          },
          children: (
            <FormInfo
              column={1}
              list={[
                <FormInfo.fields.Input name="code" label={formatMessage({ id: 'GroupSelectCode' })} rule="REQ" placeholder={formatMessage({ id: 'GroupSelectCodePlaceholder' })} />,
                <FormInfo.fields.Input name="name" label={formatMessage({ id: 'GroupSelectName' })} rule="REQ" placeholder={formatMessage({ id: 'GroupSelectNamePlaceholder' }, { name: groupName })} />,
                <SuperSelectTree
                  name="parentId"
                  label={formatMessage({ id: 'GroupSelectParent' })}
                  valueKey={valueKey}
                  labelKey={labelKey}
                  single
                  interceptor="object-output-value"
                  api={merge({}, apis?.groupList || presetApis?.group?.groupList, { params: { type, output: 'list', language } })}
                />,
                <FormInfo.fields.TextArea name="description" label={formatMessage({ id: 'GroupSelectDescription' })} placeholder={formatMessage({ id: 'GroupSelectDescPlaceholder' }, { name: groupName })} />
              ]}
            />
          )
        });
      };

      const hasApis = apis !== undefined;
      const showAdd = hasApis ? !!apis?.create : !!presetApis?.group?.create;
      const showDelete = hasApis ? !!apis?.remove : !!presetApis?.group?.remove;

      const columns = [
        { title: formatMessage({ id: 'GroupSelectCode' }), name: 'code', span: 4 },
        { title: formatMessage({ id: 'GroupSelectName' }), name: 'name', span: 6 },
        { title: formatMessage({ id: 'GroupSelectDescription' }), name: 'description', span: showDelete ? 10 : 14 }
      ];

      if (showDelete) {
        columns.push({
          title: formatMessage({ id: 'GroupSelectOperation' }),
          name: 'options',
          span: 4,
          getValueOf: (item, { context }) => {
            const { fetchApi, value, setValue } = context;
            return (
              <span onClick={e => e.stopPropagation()}>
                <a
                  onClick={() => {
                    modal.confirm({
                      title: formatMessage({ id: 'GroupSelectConfirmDelete' }),
                      content: formatMessage({ id: 'GroupSelectDeleteConfirm' }, { name: groupName, title: item.name }),
                      okText: formatMessage({ id: 'GroupSelectConfirm' }),
                      cancelText: formatMessage({ id: 'GroupSelectCancel' }),
                      onOk: () => handleDelete(item, { fetchApi, value, setValue })
                    });
                  }}>
                  {formatMessage({ id: 'GroupSelectDelete' })}
                </a>
              </span>
            );
          }
        });
      }

      const Component = callback(SuperSelectTableList);
      return (
        <Component
          className={style['group-list']}
          name={name}
          label={label}
          rule={rule}
          placeholder={placeholder}
          disabled={disabled}
          single={single}
          valueKey={valueKey}
          labelKey={labelKey}
          api={merge({}, apis?.list || presetApis?.group?.list, { params: { type, language } })}
          getSearchProps={({ searchText }) => ({
            filter: { keyword: searchText }
          })}
          pagination={{ paramsType: 'params' }}
          columns={columns}
          isPopup={false}
          footer={showAdd ? ({ reload }) => <Button type="link" onClick={() => handleAdd({ reload })}>{formatMessage({ id: 'GroupSelectAdd' }, { name: groupName })}</Button> : null}
          {...props}
        />
      );
    })
  );
};

const GroupSelect = createComponent();

GroupSelect.Field = createComponent(item => item.Field);

export { default as GroupFolder } from './GroupFolder';

export default GroupSelect;
