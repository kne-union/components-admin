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
  ALL_GROUP_VALUE,
  buildGroupSelectOptions,
  findGroupInTree,
  getAllGroupOption,
  normalizeGroupParentId,
  resolveGroupSelectValue,
  resolveGroupTreeData
} from './groupHelpers';
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
      const groupName = propsGroupName || formatMessage({ id: 'GroupSelectDefaultName' });
      const allLabel = formatMessage({ id: 'GroupSelectAll' });

      const groupApis = propsApis || presetApis?.group || {};
      const hasApis = propsApis !== undefined;
      const showManage = manageable && (hasApis ? !!(propsApis?.create || propsApis?.save) : !!(presetApis?.group?.create || presetApis?.group?.save));
      const showDelete = manageable && (hasApis ? !!propsApis?.remove : !!presetApis?.group?.remove);

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
          if (showColor && editingGroup?.color) {
            formData.color = editingGroup.color;
          }
          if (showParent) {
            formData.parentId = parentNode
              ? {
                  [valueKey]: parentNode[valueKey] ?? parentNode.code,
                  id: parentNode.id,
                  code: parentNode.code,
                  name: parentNode.name,
                  color: parentNode.color
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
              onSubmit: async values => {
                const payload = Object.assign({}, values, { type, language });
                if (showParent) {
                  payload.parentId = normalizeGroupParentId(values.parentId, valueKey);
                }
                if (editingGroup) {
                  payload.id = editingGroup.id;
                  payload.code = editingGroup.code || values.code;
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
                await reload?.();
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
              />
            )
          });
        },
        [ajax, allLabel, formModal, formatMessage, groupApis, groupName, labelKey, language, message, showColor, showParent, type, valueKey]
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
        },
        [ajax, formatMessage, groupApis.remove, message, onChange, type, value, valueKey]
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
          {...groupListApi}
          render={({ data, reload }) => {
            const treeData = resolveGroupTreeData(data);
            const options = buildGroupSelectOptions(treeData, { valueKey, allLabel });
            const selectedGroup =
              value == null || value === '' || value === ALL_GROUP_VALUE
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
                      if (!item || item[valueKey] === ALL_GROUP_VALUE || item.code === ALL_GROUP_VALUE || item.id === ALL_GROUP_VALUE) {
                        onChange?.(null, null);
                        return;
                      }
                      onChange?.(item[valueKey] ?? item.code ?? item.id, item);
                    }}
                  />
                  {selectedGroup && (showManage || showDelete) ? (
                    <Flex align="center" className={styles['group-folder-toolbar-actions']}>
                      {showManage ? (
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
                {showManage ? (
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
