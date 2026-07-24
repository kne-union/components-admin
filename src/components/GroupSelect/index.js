import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button, Flex } from 'antd';
import { FolderFilled } from '@ant-design/icons';
import Fetch from '@kne/react-fetch';
import merge from 'lodash/merge';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import { useMemo } from 'react';
import GroupFormFields from './GroupFormFields';
import GroupFolder from './GroupFolder';
import GroupFolderToolbar from './GroupFolderToolbar';
import GroupFolderField from './GroupFolderField';
import GroupFolderFilterItem from './GroupFolderFilterItem';
import createGroupSelectFilterItem from './GroupSelectFilterItem';
import { getGroupIconColor } from './GroupFolderIcon';
import {
  createGroupCodeUniqueChecker,
  findGroupInTree,
  getAllGroupOption,
  getGroupColor,
  applyGroupColorToPayload,
  DEFAULT_GROUP_COLOR,
  resolveGroupParentIdForSave,
  resolveGroupPermissions,
  resolveGroupTreeData
} from './groupHelpers';
import useGroupTreeSync from './useGroupTreeSync';
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
        showColor = false,
        showParent = true,
        onGroupChange,
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

        const [treeSyncKey, emitGroupTreeChange] = useGroupTreeSync(type, language);
        const groupListApi = useMemo(
          () =>
            merge({}, groupApis.groupList || presetApis?.group?.groupList, {
              params: { type, language, output: 'tree' }
            }),
          [groupApis.groupList, language, presetApis?.group?.groupList, type]
        );

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
            showParent && editingGroup?.parentId != null ? findGroupInTree(treeData, editingGroup.parentId, valueKey) : null;

          const formData = editingGroup
            ? {
                code: editingGroup.code,
                name: editingGroup.name,
                description: editingGroup.description
              }
            : {};
          if (showColor) {
            const groupColor = getGroupColor(editingGroup);
            if (groupColor) {
              formData.color = groupColor;
            }
          }
          if (showParent) {
            formData.parentId = parentNode
              ? {
                  [valueKey]: parentNode[valueKey] ?? parentNode.code,
                  id: parentNode.id,
                  code: parentNode.code,
                  name: parentNode.name,
                  color: getGroupColor(parentNode)
                }
              : getAllGroupOption(allLabel, valueKey);
          }

          const modalApi = formModal({
            title: formatMessage({ id: editingGroup ? 'GroupSelectEdit' : 'GroupSelectAdd' }, { name: groupName }),
            size: 'small',
            formProps: {
              data: formData,
              rules: buildFormRules(editingGroup),
              onSubmit: async formDataValues => {
                let payload = Object.assign({}, formDataValues, { type, language });
                if (showParent) {
                  payload.parentId = resolveGroupParentIdForSave(formDataValues.parentId, treeData, valueKey);
                }
                if (showColor) {
                  payload = applyGroupColorToPayload(payload, {
                    color: formDataValues.color || DEFAULT_GROUP_COLOR,
                    existingOptions: editingGroup?.options
                  });
                }
                if (editingGroup) {
                  payload.id = editingGroup.id;
                  payload.code = editingGroup.code || formDataValues.code;
                } else if (!allowCustomCode) {
                  delete payload.code;
                }
                const api = Object.assign(
                  {},
                  editingGroup
                    ? groupApis.save || groupApis.create || presetApis?.group?.save
                    : groupApis.create || groupApis.save || presetApis?.group?.create,
                  { data: payload }
                );
                const { data: resData } = await ajax(api);
                if (resData.code !== 0) {
                  return false;
                }
                message.success(formatMessage({ id: editingGroup ? 'GroupSelectEditSuccess' : 'GroupSelectAddSuccess' }));
                const action = editingGroup ? 'edit' : 'add';
                await reload?.();
                emitGroupTreeChange(action, payload);
                onGroupChange?.(action, payload);
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
                showParent={showParent}
                showColor={showColor}
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
            await reload?.();
            emitGroupTreeChange('delete', item);
            onGroupChange?.('delete', item);

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

        const columns = [
          ...(allowCustomCode
            ? [{ title: formatMessage({ id: 'GroupSelectCode' }), name: 'code' }]
            : []),
          showColor
            ? {
                title: formatMessage({ id: 'GroupSelectName' }),
                name: 'name',
                getValueOf: item => (
                  <Flex align="center" gap={8}>
                    <FolderFilled
                      className={style['group-folder-toolbar-color-icon']}
                      style={{ color: getGroupIconColor(item, { valueKey }) }}
                    />
                    <span>{item[labelKey] || item.name}</span>
                  </Flex>
                )
              }
            : { title: formatMessage({ id: 'GroupSelectName' }), name: 'name' },
          {
            title: formatMessage({ id: 'GroupSelectDescription' }),
            name: 'description'
          }
        ];

        if (showEdit || showDelete) {
          columns.push({
            title: formatMessage({ id: 'GroupSelectOperation' }),
            name: 'options',
            type: 'options',
            renderType: 'options',
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
                  message: formatMessage({ id: 'GroupSelectDeleteConfirm' }, { name: groupName, title: item.name }),
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
          return <div className={style['group-list']}>{formatMessage({ id: 'GroupSelectLoading' })}</div>;
        }
        return (
          <Fetch
            key={treeSyncKey}
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
                    return [item.code, item.name, item.description].filter(Boolean).join(' ').toLowerCase().includes(keyword);
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
const GroupSelectFilterItem = createGroupSelectFilterItem(GroupSelect.Field);
GroupSelect.FilterItem = GroupSelectFilterItem;
GroupSelect.GroupFolder = GroupFolder;
GroupSelect.GroupFolderField = GroupFolderField;
GroupSelect.GroupFolderToolbar = GroupFolderToolbar;
GroupSelect.GroupFolderFilterItem = GroupFolderFilterItem;
GroupSelect.GroupFormFields = GroupFormFields;

export { GroupFolder, GroupFolderField, GroupFolderToolbar, GroupFolderFilterItem, GroupFormFields, GroupSelectFilterItem };

export default GroupSelect;
