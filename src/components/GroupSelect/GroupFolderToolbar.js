import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button, Flex } from 'antd';
import { DeleteOutlined, EditOutlined, FolderAddFilled, FolderFilled } from '@ant-design/icons';
import { createGroupItemContentRender, getGroupIconColor } from './GroupFolderIcon';
import Fetch from '@kne/react-fetch';
import merge from 'lodash/merge';
import { useCallback, useMemo } from 'react';
import useControlValue from '@kne/use-control-value';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import GroupFormFields from './GroupFormFields';
import {
  buildGroupSelectOptions,
  createGroupCodeUniqueChecker,
  findGroupInTree,
  getAllGroupOption,
  getGroupColor,
  applyGroupColorToPayload,
  DEFAULT_GROUP_COLOR,
  isAllGroupOption,
  resolveGroupParentIdForSave,
  resolveGroupPermissions,
  resolveGroupSelectValue,
  resolveGroupTreeData
} from './groupHelpers';
import useGroupTreeSync from './useGroupTreeSync';
import styles from './style.module.scss';

const GroupFolderToolbar = createWithRemoteLoader({
  modules: [
    'components-core:Global@usePreset',
    'components-core:Global@useGlobalValue',
    'components-core:FormInfo',
    'components-core:Common@SuperSelectTreeField',
    'components-core:ConfirmButton'
  ]
})(
  withLocale(
    ({
      remoteModules,
      type,
      language: propsLanguage,
      apis: propsApis,
      valueKey = 'code',
      labelKey = 'name',
      groupName: propsGroupName,
      compact = false,
      manageable = true,
      showParent = true,
      showColor = false,
      permissions,
      allowCustomCode = false,
      ...props
    }) => {
      const [value, onChange] = useControlValue(props);
      const { formatMessage } = useIntl();
      const [usePreset, useGlobalValue, FormInfo, SuperSelectTreeField, ConfirmButton] = remoteModules;
      const { ajax, apis: presetApis } = usePreset();
      const { useFormModal } = FormInfo;
      const formModal = useFormModal();
      const { message } = App.useApp();
      const locale = useGlobalValue('locale');
      const language = propsLanguage || locale || 'zh-CN';
      const [treeSyncKey, emitGroupTreeChange] = useGroupTreeSync(type, language);
      const groupName = propsGroupName || formatMessage({ id: 'GroupSelectDefaultName' });
      const allLabel = formatMessage({ id: 'GroupSelectAll' });

      const groupApis = propsApis || presetApis?.group || {};
      const hasApis = propsApis !== undefined;
      const hasAddApi = hasApis ? !!(propsApis?.create || propsApis?.save) : !!(presetApis?.group?.create || presetApis?.group?.save);
      const hasEditApi = hasApis ? !!(propsApis?.save || propsApis?.create) : !!(presetApis?.group?.save || presetApis?.group?.create);
      const hasRemoveApi = hasApis ? !!propsApis?.remove : !!presetApis?.group?.remove;
      const { showAdd, showEdit, showDelete } = resolveGroupPermissions(permissions, {
        hasAddApi,
        hasEditApi,
        hasRemoveApi,
        manageable
      });

      const groupListApi = useMemo(
        () =>
          merge({}, groupApis.groupList, {
            params: Object.assign({}, groupApis.groupList?.params, { type, language, output: 'tree' })
          }),
        [groupApis.groupList, language, type]
      );

      const openGroupForm = useCallback(
        ({ editingGroup = null, treeData = [], reload } = {}) => {
          const parentNode =
            showParent && editingGroup?.parentId != null
              ? findGroupInTree(treeData, editingGroup.parentId, valueKey)
              : null;

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
            title: formatMessage(
              { id: editingGroup ? 'GroupSelectEdit' : 'GroupSelectAdd' },
              { name: groupName }
            ),
            size: 'small',
            formProps: {
              data: formData,
              rules:
                allowCustomCode && !editingGroup
                  ? {
                      GROUP_CODE_UNIQUE: createGroupCodeUniqueChecker({
                        ajax,
                        api: groupApis.groupList,
                        type,
                        language,
                        valueKey,
                        duplicateMessage: formatMessage({ id: 'GroupSelectCodeDuplicate' })
                      })
                    }
                  : undefined,
              onSubmit: async values => {
                let payload = Object.assign({}, values, { type, language });
                if (showParent) {
                  payload.parentId = resolveGroupParentIdForSave(values.parentId, treeData, valueKey);
                }
                if (showColor) {
                  payload = applyGroupColorToPayload(payload, {
                    color: values.color || DEFAULT_GROUP_COLOR,
                    existingOptions: editingGroup?.options
                  });
                }
                if (editingGroup) {
                  payload.id = editingGroup.id;
                  payload.code = editingGroup.code || values.code;
                } else if (!allowCustomCode) {
                  delete payload.code;
                }
                const api = Object.assign({}, editingGroup ? groupApis.save || groupApis.create : groupApis.create || groupApis.save, {
                  data: payload
                });
                const { data: resData } = await ajax(api);
                if (resData.code !== 0) {
                  return false;
                }
                message.success(
                  formatMessage({ id: editingGroup ? 'GroupSelectEditSuccess' : 'GroupSelectAddSuccess' })
                );
                const action = editingGroup ? 'edit' : 'add';
                await reload?.();
                emitGroupTreeChange(action, payload);
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
                groupListApi={groupApis.groupList}
                valueKey={valueKey}
                labelKey={labelKey}
                groupName={groupName}
                showParent={showParent}
                showColor={showColor}
                allowCustomCode={allowCustomCode}
              />
            )
          });
        },
        [
          ajax,
          allLabel,
          allowCustomCode,
          emitGroupTreeChange,
          formModal,
          formatMessage,
          groupApis,
          groupName,
          labelKey,
          language,
          message,
          showColor,
          showParent,
          type,
          valueKey
        ]
      );

      const handleDelete = useCallback(
        async ({ group, reload }) => {
          const { data: resData } = await ajax(
            Object.assign({}, groupApis.remove, {
              data: { id: group.id, code: group.code, type }
            })
          );
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'GroupSelectDeleteSuccess' }));
          const currentKey = value?.[valueKey] ?? value?.code ?? value?.id ?? value;
          if (currentKey != null && (String(currentKey) === String(group[valueKey]) || String(currentKey) === String(group.code) || String(currentKey) === String(group.id))) {
            onChange?.(null, null);
          }
          await reload?.();
          emitGroupTreeChange('delete', group);
        },
        [ajax, emitGroupTreeChange, formatMessage, groupApis.remove, message, onChange, type, value, valueKey]
      );

      if (!groupApis.groupList) {
        return (
          <div className={styles['loading-wrapper']}>
            {formatMessage({ id: 'GroupSelectLoading' })}
          </div>
        );
      }

      return (
        <Fetch
          key={treeSyncKey}
          {...groupListApi}
          render={({ data, reload }) => {
            const treeData = resolveGroupTreeData(data);
            const options = buildGroupSelectOptions(treeData, { valueKey, allLabel });
            const selectedGroup = isAllGroupOption(value, valueKey)
              ? null
              : findGroupInTree(treeData, typeof value === 'object' ? value[valueKey] ?? value.code ?? value.id : value, valueKey);
            const selectValue = resolveGroupSelectValue(value, options, { valueKey, labelKey, allLabel });

            const colorProps = showColor
              ? {
                  prefix: () => {
                    const selected = Array.isArray(selectValue) ? selectValue[0] : selectValue;
                    return <FolderFilled className={styles['group-folder-toolbar-color-icon']} style={{ color: getGroupIconColor(selected, { valueKey }) }} />;
                  },
                  renderItemContent: createGroupItemContentRender({ valueKey, labelKey })
                }
              : null;

            return (
              <Flex align="center" gap={compact ? 6 : 8} className={styles['group-folder-toolbar']}>
                <Flex align="center" className={styles['group-folder-toolbar-group']}>
                  <SuperSelectTreeField
                    single
                    allowClear={false}
                    isPopup
                    valueKey={valueKey}
                    labelKey={labelKey}
                    parentKey="parentId"
                    options={options}
                    value={selectValue}
                    placeholder={allLabel}
                    {...colorProps}
                    className={compact ? styles['group-folder-toolbar-select-compact'] : styles['group-folder-toolbar-select']}
                    onChange={selected => {
                      const item = Array.isArray(selected) ? selected[0] : selected;
                      if (isAllGroupOption(item, valueKey)) {
                        onChange?.(null, null);
                        return;
                      }
                      onChange?.(item[valueKey] ?? item.code ?? item.id, item);
                    }}
                  />
                  {selectedGroup && (showEdit || showDelete) ? (
                    <Flex align="center" className={styles['group-folder-toolbar-actions']}>
                      {showEdit ? (
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          wave={{ disabled: true }}
                          title={formatMessage({ id: 'GroupSelectEdit' }, { name: groupName })}
                          onClick={() => openGroupForm({ editingGroup: selectedGroup, treeData, reload })}
                        />
                      ) : null}
                      {showDelete ? (
                        <ConfirmButton
                          type="text"
                          size="small"
                          danger
                          isDelete
                          icon={<DeleteOutlined />}
                          wave={{ disabled: true }}
                          message={formatMessage({ id: 'GroupSelectDeleteConfirm' }, { name: groupName, title: selectedGroup.name })}
                          onClick={() => handleDelete({ group: selectedGroup, reload })}
                        />
                      ) : null}
                    </Flex>
                  ) : null}
                </Flex>
                {showAdd ? (
                  <button
                    type="button"
                    className={styles['group-folder-toolbar-add']}
                    title={formatMessage({ id: 'GroupSelectAdd' }, { name: groupName })}
                    aria-label={formatMessage({ id: 'GroupSelectAdd' }, { name: groupName })}
                    onClick={() => openGroupForm({ treeData, reload })}
                  >
                    <FolderAddFilled />
                  </button>
                ) : null}
              </Flex>
            );
          }}
        />
      );
    }
  )
);

export default GroupFolderToolbar;
