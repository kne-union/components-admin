/**
 * 将扁平组织列表转为 antd Tree 所需的树形结构。
 * @param {Array} list
 * @param {{ rootId?: string, rootName?: string }} options
 */
const buildOrgTreeData = (list, { rootId, rootName } = {}) => {
  if (!Array.isArray(list) || !list.length) {
    return [];
  }

  const parseChildren = parentId => {
    return list
      .filter(item => {
        if (parentId == null) {
          return item.parentId == null || item.parentId === '';
        }
        return String(item.parentId) === String(parentId);
      })
      .map(item =>
        Object.assign({}, item, {
          children: parseChildren(item.id)
        })
      )
      .map(item => {
        if (!item.children?.length) {
          const { children, ...rest } = item;
          return rest;
        }
        return item;
      });
  };

  if (rootId != null) {
    return [
      {
        id: rootId,
        name: rootName || '',
        selectable: false,
        children: parseChildren(null)
      }
    ];
  }

  return parseChildren(null);
};

export default buildOrgTreeData;
