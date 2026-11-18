import buildActionList from './buildActionList';

/**
 * 生成 BizUnit 的 getActionList 回调。
 * BizUnit 调用时会把自己的 apis（仅 { list }）放进 props，所以完整的 apis 必须放在最后，
 * 覆盖 props 里的同名字段；否则编辑 / 邀请 / 删除等写接口会丢失。
 */
const createGetActionList =
  ({ formatMessage, apis, getActions }) =>
  ({ data, className, ...props }) => {
    const list = buildActionList({ ...props, formatMessage, data, className, apis });
    const extended = typeof getActions === 'function' ? getActions({ list, data }) : null;
    return Array.isArray(extended) ? extended : list;
  };

export default createGetActionList;
