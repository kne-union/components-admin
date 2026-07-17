import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import classnames from 'classnames';
import { Tree, Flex } from 'antd';
import useControlValue from '@kne/use-control-value';
import { FolderFilled, FolderOpenFilled } from '@ant-design/icons';
import { useMemo } from 'react';
import merge from 'lodash/merge';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import { resolveGroupTreeData } from './groupHelpers';
import styles from './style.module.scss';

const GroupFolder = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Global@useGlobalValue']
})(
  withLocale(
    ({
      remoteModules,
      type,
      language: propsLanguage,
      showRoot = true,
      rootTitle,
      children,
      apis: propsApis,
      className,
      style,
      valueKey = 'code',
      labelKey = 'name',
      ...props
    }) => {
      const [value, onChange] = useControlValue(props);
      const { formatMessage } = useIntl();
      const [usePreset, useGlobalValue] = remoteModules;
      const { apis: presetApis } = usePreset();
      const locale = useGlobalValue('locale');

      const language = propsLanguage || locale || 'zh-CN';
      const displayRootTitle = rootTitle || formatMessage({ id: 'GroupSelectAll' });
      const groupApis = propsApis || presetApis?.group || {};
      const groupListApi = useMemo(
        () =>
          merge({}, groupApis.groupList, {
            params: Object.assign({}, groupApis.groupList?.params, { type, language, output: 'tree' })
          }),
        [groupApis.groupList, language, type]
      );

      const selectedKeys = useMemo(() => {
        if (value == null || value === '') {
          return ['root'];
        }
        return [typeof value === 'object' ? value[valueKey] ?? value.code ?? value.id : value];
      }, [value, valueKey]);

      if (!groupApis.groupList) {
        return (
          <div className={styles['loading-wrapper']} style={style}>
            {formatMessage({ id: 'GroupSelectLoading' })}
          </div>
        );
      }

      return (
        <Fetch
          {...groupListApi}
          render={({ data, loading }) => {
            if (loading) {
              return <div className={styles['loading-wrapper']}>{formatMessage({ id: 'GroupSelectLoading' })}</div>;
            }

            const nodes = resolveGroupTreeData(data);
            const treeData = showRoot
              ? [
                  {
                    code: 'root',
                    id: 'root',
                    name: displayRootTitle,
                    children: nodes
                  }
                ]
              : nodes;

            const tree = (
              <Tree
                showIcon
                defaultExpandAll
                selectedKeys={selectedKeys}
                treeData={treeData}
                titleRender={item => item[labelKey] || item.name}
                fieldNames={{ title: labelKey, key: valueKey, children: 'children' }}
                onSelect={(keys, info) => {
                  const selectedKey = keys[0];
                  if (!onChange) {
                    return;
                  }
                  if (selectedKey === 'root' || selectedKey == null) {
                    onChange(null, null);
                    return;
                  }
                  onChange(selectedKey, info?.selectedNodes?.[0] || null);
                }}
                icon={nodeProps => {
                  const color = nodeProps.data?.color;
                  const iconStyle = color ? { color } : undefined;
                  if (nodeProps.key === 'root') {
                    return <FolderFilled style={iconStyle} />;
                  }
                  return nodeProps.expanded ? <FolderOpenFilled style={iconStyle} /> : <FolderFilled style={iconStyle} />;
                }}
                {...props}
              />
            );

            if (typeof children === 'function') {
              return children({ treeData: nodes, selectedKeys, onChange, tree });
            }

            return (
              <Flex gap={12} flex={1} className={classnames(styles['group-folder-layout'], className)} style={style}>
                <Flex flex="0 0 280px" className={styles['group-folder']}>
                  {tree}
                </Flex>
                <Flex vertical flex={1} style={{ minWidth: 0 }}>
                  {children}
                </Flex>
              </Flex>
            );
          }}
        />
      );
    }
  )
);

export default GroupFolder;
