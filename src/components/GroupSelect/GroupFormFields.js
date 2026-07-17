import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { useMemo } from 'react';
import { useIntl } from '@kne/react-intl';
import { FolderFilled } from '@ant-design/icons';
import withLocale from './withLocale';
import GroupColorPickerField from './GroupColorPickerField';
import { createGroupItemContentRender, getGroupIconColor } from './GroupFolderIcon';
import { buildGroupSelectOptions, DEFAULT_GROUP_COLOR, getAllGroupOption, resolveGroupTreeData } from './groupHelpers';
import styles from './style.module.scss';

const GroupFormFields = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(
    ({
      remoteModules,
      treeData = [],
      editingGroup = null,
      type,
      language,
      apis,
      groupListApi,
      valueKey = 'code',
      labelKey = 'name',
      groupName,
      showParent = true,
      showColor = false
    }) => {
      const [FormInfo] = remoteModules;
      const { formatMessage } = useIntl();
      const { fields } = FormInfo;
      const { Input, TextArea, SuperSelectTree } = fields;
      const displayName = groupName || formatMessage({ id: 'GroupSelectDefaultName' });
      const allLabel = formatMessage({ id: 'GroupSelectAll' });

      const parentOptions = useMemo(
        () =>
          buildGroupSelectOptions(treeData, {
            valueKey,
            allLabel,
            excludeKey: editingGroup ? editingGroup[valueKey] ?? editingGroup.id ?? editingGroup.code : null
          }),
        [allLabel, editingGroup, treeData, valueKey]
      );

      const parentApi = useMemo(() => {
        if (treeData?.length) {
          return undefined;
        }
        return merge({}, groupListApi || apis?.groupList, {
          params: { type, language, output: 'list' },
          transformData: data => {
            const list = resolveGroupTreeData(data);
            return [getAllGroupOption(allLabel, valueKey), ...list];
          }
        });
      }, [allLabel, apis, groupListApi, language, treeData, type, valueKey]);

      const parentFieldProps = parentApi
        ? { api: parentApi }
        : { options: parentOptions };

      const parentColorProps = showColor
        ? {
            renderItemContent: createGroupItemContentRender({ valueKey, labelKey }),
            prefix: ({ value }) => {
              const selected = Array.isArray(value) ? value[0] : value;
              if (!selected) {
                return null;
              }
              return <FolderFilled className={styles['group-folder-toolbar-color-icon']} style={{ color: getGroupIconColor(selected, { valueKey }) }} />;
            }
          }
        : null;

      return (
        <FormInfo
          column={1}
          list={[
            <Input
              key="code"
              name="code"
              label={formatMessage({ id: 'GroupSelectCode' })}
              rule="REQ"
              disabled={!!editingGroup}
              placeholder={formatMessage({ id: 'GroupSelectCodePlaceholder' })}
            />,
            <Input
              key="name"
              name="name"
              label={formatMessage({ id: 'GroupSelectName' })}
              rule="REQ"
              placeholder={formatMessage({ id: 'GroupSelectNamePlaceholder' }, { name: displayName })}
            />,
            showParent ? (
              <SuperSelectTree
                key="parentId"
                name="parentId"
                label={formatMessage({ id: 'GroupSelectParent' })}
                valueKey={valueKey}
                labelKey={labelKey}
                single
                allowClear
                interceptor="object-output-value"
                placeholder={allLabel}
                {...parentColorProps}
                {...parentFieldProps}
              />
            ) : null,
            showColor ? (
              <GroupColorPickerField
                key="color"
                name="color"
                label={formatMessage({ id: 'GroupSelectColor' })}
                defaultValue={editingGroup?.color || DEFAULT_GROUP_COLOR}
              />
            ) : null,
            <TextArea
              key="description"
              name="description"
              label={formatMessage({ id: 'GroupSelectDescription' })}
              placeholder={formatMessage({ id: 'GroupSelectDescPlaceholder' }, { name: displayName })}
            />
          ].filter(Boolean)}
        />
      );
    }
  )
);

export default GroupFormFields;
