import { Flex } from 'antd';
import { FolderFilled, FolderOpenFilled } from '@ant-design/icons';
import classnames from 'classnames';
import { DEFAULT_GROUP_COLOR, getGroupColor, isAllGroupOption } from './groupHelpers';
import styles from './style.module.scss';

export const getGroupIconColor = (item, { valueKey = 'code' } = {}) => {
  return isAllGroupOption(item, valueKey) ? 'var(--font-color-grey, #8c8c8c)' : getGroupColor(item) || DEFAULT_GROUP_COLOR;
};

// 展开/收起状态由外层 .ant-tree-treenode-switcher-open 类通过 CSS 切换两个图标的显隐
const GroupFolderStateIcon = ({ color, className }) => (
  <span className={classnames(styles['group-folder-state-icon'], className)} style={{ color }}>
    <FolderFilled className={styles['group-folder-state-icon-closed']} />
    <FolderOpenFilled className={styles['group-folder-state-icon-open']} />
  </span>
);

export const createGroupItemContentRender =
  ({ valueKey = 'code', labelKey = 'name' } = {}) =>
  ({ item }) => (
    <Flex align="center" gap={8} className={styles['group-folder-menu-item']}>
      <GroupFolderStateIcon color={getGroupIconColor(item, { valueKey })} />
      <span className={styles['group-folder-menu-item-label']}>{item[labelKey] || item.name}</span>
    </Flex>
  );

export default GroupFolderStateIcon;
