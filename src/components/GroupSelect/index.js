import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';
import Fetch from '@kne/react-fetch';
import merge from 'lodash/merge';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import GroupFormFields from './GroupFormFields';
import GroupFolder from './GroupFolder';
import GroupFolderToolbar from './GroupFolderToolbar';
import {
  createGroupCodeUniqueChecker,
  findGroupInTree,
  getAllGroupOption,
  resolveGroupParentIdForSave,
  resolveGroupPermissions,
  resolveGroupTreeData
} from './groupHelpers';
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
    withLocale(
      ({
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
        permissions,
        allowCustomCode = true,
        ...props
      }) => {
        const { formatMessage } = useIntl();
        const groupName = propsGroupName || formatMessage({ id: 'GroupSelectDefaultName' });
        const [FormInfo, useFormModal, usePreset, useGlobalValue] = remoteModules;
        const { fields } = FormInfo;
        const { SuperSelectTableList } = fields;
        const { ajax, apis: presetApis } = usePreset();
        const { message } = App.useApp();
        const formModal = useFormModal();
        const locale = useGlobalValue('locale');

        const language = propsLanguage || locale || 'zh-CN';

        const hasApis = apis !== undefined;
        const groupApis = hasApis ? apis || {} : presetApis?.group || {};
        const hasAddApi = hasApis ? !!(apis?.create || apis?.save) : !!(presetApis?.group?.create || presetApis?.group?.save);
        const hasEditApi = hasApis ? !!(apis?.save || apis?.create) : !!(presetApis?.group?.save || presetApis?.group?.create);
        const hasRemoveApi = hasApis ? !!apis?.remove : !!presetApis?.group?.remove;
        const { showAdd, showEdit, showDelete } = resolveGroupPermissions(permissions, {
          hasAddApi,
          hasEditApi,
          hasRemoveApi
        });

        const groupListApi = merge({}, groupApis.groupList || presetApis?.group?.groupList, {
          params: { type, language, output: 'tree' }
        });

        const buildFormRules = editingGroup =>
          allowCustomCode && !editingGroup
            ? {
                GROUP_CODE_UNIQUE: createGroupCodeUniqueChecker({
                  ajax,
                  api: groupApis.groupList || presetApis?.group?.groupList || groupApis.list || presetApis?.group?.list,
                  type,
                  language,
                  valueKey,
                  duplicateMessage: formatMessage({ id: 'GroupSelectCodeDuplicate' })
                })
              }
            : undefined;

        const openGroupForm = ({ editingGroup = null, treeData = [], reload } = {}) => {
          const allLabel = formatMessage({ id: 'GroupSelectAll' });
          const parentNode =
            editingGroup?.parentId != null ? findGroupInTree(treeData, editingGroup.parentId, valueKey) : null;

          const formData = editingGroup
            ? {
                code: editingGroup.code,
                name: editingGroup.name,
                description: editingGroup.description,
                parentId: parentNode
                  ? {
                      [valueKey]: parentNode[valueKey] ?? parentNode.code,
                      id: parentNode.id,
                      code: parentNode.code,
                      name: parentNode.name
                    }
                  : getAllGroupOption(allLabel, valueKey)
              }
            : {};

          const modalApi = formModal({
            title: formatMessage({ id: editingGroup ? 'GroupSelectEdit' : 'GroupSelectAdd' }, { name: groupName }),
            size: 'small',
            formProps: {
              data: formData,
              rules: buildFormRules(editingGroup),
              onSubmit: async formDataValues => {
                const payload = Object.assign({}, formDataValues, { type, language });
                payload.parentId = resolveGroupParentIdForSave(formDataValues.parentId, treeData, valueKey);
                if (editingGroup) {
                  payload.id = editingGroup.id;
                  payload.code = editingGroup.code || formDataValues.code;
                } else if (!allowCustomCode) {
                  delete payload.code;
                }
                const api = Object.assign(
                  {},
                  editingGroup ? groupApis.save || groupApis.create || presetApis?.group?.save : groupApis.create || groupApis.save || presetApis?.group?.create,
                  { data: payload }
                );
                const { data: resData } = await ajax(api);
                if (resData.code !== 0) {
                  return false;
                }
                message.success(
                  formatMessage({ id: editingGroup ? 'GroupSelectEditSuccess' : 'GroupSelectAddSuccess' })
                );
                reload?.();
                modalApi.close();
                return true;
              }
            },
            children: (
              <GroupFormFields
                treeData={treeData}
                editingGroup={editingGroup}
                type={type}
                language={language}
                apis={groupApis}
                groupListApi={groupApis.groupList || presetApis?.group?.groupList}
                valueKey={valueKey}
                labelKey={labelKey}
                groupName={groupName}
                allowCustomCode={allowCustomCode}
              />
            )
          });
        };

        const handleDelete = async (item, { reload, value, setValue }) => {
          try {
            const { data: resData } = await ajax(
              Object.assign({}, groupApis.remove || presetApis?.group?.remove, {
                data: { id: item.id, code: item.code, type }
              })
            );

            if (resData.code !== 0) {
              return;
            }

            message.success(formatMessage({ id: 'GroupSelectDeleteSuccess' }));
            reload?.();

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

        const operationSpan = (showEdit ? 2 : 0) + (showDelete ? 2 : 0);
        const columns = [
          { title: formatMessage({ id: 'GroupSelectCode' }), name: 'code', span: 4 },
          { title: formatMessage({ id: 'GroupSelectName' }), name: 'name', span: 6 },
          {
            title: formatMessage({ id: 'GroupSelectDescription' }),
            name: 'description',
            span: operationSpan ? 14 - operationSpan : 14
          }
        ];

        if (operationSpan) {
          columns.push({
            title: formatMessage({ id: 'GroupSelectOperation' }),
            name: 'options',
            renderType: 'options',
            span: Math.max(operationSpan, 4),
            getValueOf: (item, { context }) => {
              const { value, setValue, reload: contextReload, treeData = [] } = context;
              const reload = context.reload || contextReload;
              const actions = [];
              if (showEdit) {
                actions.push({
                  children: formatMessage({ id: 'GroupSelectEditAction' }),
                  onClick: e => {
                    e?.stopPropagation?.();
                    openGroupForm({
                      editingGroup: item,
                      treeData,
                      reload
                    });
                  }
                });
              }
              if (showDelete) {
                actions.push({
                  children: formatMessage({ id: 'GroupSelectDelete' }),
                  isDelete: true,
                  message: formatMessage(
                    { id: 'GroupSelectDeleteConfirm' },
                    { name: groupName, title: item.name }
                  ),
                  onClick: e => {
                    e?.stopPropagation?.();
                    return handleDelete(item, { reload, value, setValue });
                  }
                });
              }
              return actions;
            }
          });
        }

        const Component = callback(SuperSelectTableList);
        if (!groupListApi?.url && !groupListApi?.loader && !groupListApi?.data) {
          return (
            <div className={style['group-list']}>
              {formatMessage({ id: 'GroupSelectLoading' })}
            </div>
          );
        }
        return (
          <Fetch
            {...groupListApi}
            render={({ data, reload }) => {
              const treeData = resolveGroupTreeData(data);
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
                  isPopup={false}
                  {...props}
                  dataType="tree"
                  defaultExpandedKeys
                  options={treeData}
                  getSearchCallback={({ searchText }, item) => {
                    if (!searchText) {
                      return true;
                    }
                    const keyword = String(searchText).toLowerCase();
                    return [item.code, item.name, item.description]
                      .filter(Boolean)
                      .join(' ')
                      .toLowerCase()
                      .includes(keyword);
                  }}
                  columns={columns.map(col => {
                    if (col.name !== 'options') {
                      return col;
                    }
                    return Object.assign({}, col, {
                      getValueOf: (item, { context }) =>
                        col.getValueOf(item, {
                          context: Object.assign({}, context, { reload, treeData })
                        })
                    });
                  })}
                  footer={
                    showAdd
                      ? () => (
                          <Button type="link" onClick={() => openGroupForm({ treeData, reload })}>
                            {formatMessage({ id: 'GroupSelectAdd' }, { name: groupName })}
                          </Button>
                        )
                      : null
                  }
                />
              );
            }}
          />
        );
      }
    )
  );
};

const GroupSelect = createComponent();

GroupSelect.Field = createComponent(item => item.Field);
GroupSelect.GroupFolder = GroupFolder;
GroupSelect.GroupFolderToolbar = GroupFolderToolbar;
GroupSelect.GroupFormFields = GroupFormFields;

export { GroupFolder, GroupFolderToolbar, GroupFormFields };

export default GroupSelect;
