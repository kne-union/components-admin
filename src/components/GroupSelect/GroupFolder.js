import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { Tree, Flex } from 'antd';
import useControlValue from '@kne/use-control-value';
import { FolderOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import styles from './style.module.scss';

const GroupFolder = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Global@useGlobalValue']
})(
  withLocale(({ remoteModules, type, language: propsLanguage, showRoot = true, rootTitle, children, ...props }) => {
    const [value, onChange] = useControlValue(props);
    const { formatMessage } = useIntl();
    const [usePreset, useGlobalValue] = remoteModules;
    const { apis } = usePreset();
    const locale = useGlobalValue('locale');

    const language = propsLanguage || locale || 'zh-CN';
    const displayRootTitle = rootTitle || formatMessage({ id: 'GroupSelectAll' });

    const selectedKeys = useMemo(() => {
      if (!value) return ['root'];
      return [value];
    }, [value]);

    return (
      <Fetch
        {...apis.group.groupList}
        params={{ type, language, output: 'tree' }}
        render={({ data, loading }) => {
          if (loading) {
            return <div className={styles['loading-wrapper']}>{formatMessage({ id: 'GroupSelectLoading' })}</div>;
          }

          const treeData = showRoot
            ? [
                {
                  code: 'root',
                  name: displayRootTitle,
                  children: data || []
                }
              ]
            : data || [];
          const tree = (
            <Tree
              showIcon
              defaultExpandAll
              selectedKeys={selectedKeys}
              treeData={treeData}
              titleRender={item => item.name}
              fieldNames={{ title: 'name', key: 'code', children: 'children' }}
              onSelect={(keys, item) => {
                const selectedKey = keys[0];
                if (onChange) {
                  onChange(selectedKey === 'root' ? null : selectedKey, selectedKey === 'root' ? null : item.selectedNodes[0]);
                }
              }}
              icon={props => {
                if (props.key === 'root') return <FolderOutlined />;
                return props.expanded ? <FolderOpenOutlined /> : <FolderOutlined />;
              }}
              {...props}
            />
          );
          if (typeof children === 'function') {
            return children({ treeData, selectedKeys, onChange, tree });
          }
          return (
            <Flex gap={12} flex={1}>
              <Flex flex="0 0 280px" className={styles['group-folder']}>
                {tree}
              </Flex>
              <Flex vertical flex={1} style={{ minWidth: '0' }}>
                {children}
              </Flex>
            </Flex>
          );
        }}
      />
    );
  })
);

export default GroupFolder;
