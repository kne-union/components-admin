import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';
import { FolderFilled } from '@ant-design/icons';
import Fetch from '@kne/react-fetch';
import merge from 'lodash/merge';
import { useCallback, useMemo } from 'react';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import GroupFormFields from './GroupFormFields';
import { createGroupItemContentRender, getGroupIconColor } from './GroupFolderIcon';
import {
  createGroupCodeUniqueChecker,
  findGroupInTree,
  flattenGroupTree,
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

/** 与 GroupSelect 相同：默认 Form 字段，.Field 为非表单受控 */
const createComponent = (callback = item => item) =>
  createWithRemoteLoader({
    modules: ['components-core:Global@usePreset', 'components-core:Global@useGlobalValue', 'components-core:FormInfo']
  })(
    withLocale(
      ({
        remoteModules,
        type,
        language: propsLanguage,
        apis: propsApis,
        valueKey = 'code',
        labelKey = 'name',
        single = true,
        showColor = false,
        showParent = true,
        manageable = true,
        permissions,
        allowCustomCode = false,
        groupName: propsGroupName,
        ...props
      }) => {
        const { formatMessage } = useIntl();
        const [usePreset, useGlobalValue, FormInfo] = remoteModules;
        const { fields, useFormModal } = FormInfo;
        const { SuperSelectTree } = fields;
        const Component = callback(SuperSelectTree);
        const { ajax, apis: presetApis } = usePreset();
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
        const { showAdd } = resolveGroupPermissions(permissions, {
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
              title: formatMessage({ id: editingGroup ? 'GroupSelectEdit' : 'GroupSelectAdd' }, { name: groupName }),
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
                  message.success(formatMessage({ id: editingGroup ? 'GroupSelectEditSuccess' : 'GroupSelectAddSuccess' }));
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

        if (!groupApis.groupList) {
          return <div className={style['loading-wrapper']}>{formatMessage({ id: 'GroupSelectLoading' })}</div>;
        }

        return (
          <Fetch
            key={treeSyncKey}
            {...groupListApi}
            render={({ data, loading, reload }) => {
              const treeData = loading ? [] : resolveGroupTreeData(data);
              const options = flattenGroupTree(treeData, null, valueKey);
              const colorProps = showColor
                ? {
                    prefix: ({ value }) => {
                      const selected = Array.isArray(value) ? value[0] : value;
                      return (
                        <FolderFilled
                          className={style['group-folder-toolbar-color-icon']}
                          style={{ color: getGroupIconColor(selected, { valueKey }) }}
                        />
                      );
                    },
                    renderItemContent: createGroupItemContentRender({ valueKey, labelKey })
                  }
                : null;
              return (
                <Component
                  {...props}
                  {...colorProps}
                  single={single}
                  valueKey={valueKey}
                  labelKey={labelKey}
                  parentKey="parentId"
                  options={options}
                  footer={
                    showAdd
                      ? () => (
                          <Button type="link" onClick={() => openGroupForm({ treeData, reload })}>
                            {formatMessage({ id: 'GroupSelectAdd' }, { name: groupName })}
                          </Button>
                        )
                      : props.footer
                  }
                />
              );
            }}
          />
        );
      }
    )
  );

const GroupFolderField = createComponent();
GroupFolderField.Field = createComponent(item => item.Field);

export default GroupFolderField;
