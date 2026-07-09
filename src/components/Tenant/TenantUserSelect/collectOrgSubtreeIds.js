const collectOrgSubtreeIds = (orgs, rootId) => {
  const ids = new Set([String(rootId)]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const org of orgs) {
      const id = String(org.id);
      const parentId = org.parentId != null && org.parentId !== '' ? String(org.parentId) : null;
      if (parentId && ids.has(parentId) && !ids.has(id)) {
        ids.add(id);
        changed = true;
      }
    }
  }
  return [...ids];
};

export default collectOrgSubtreeIds;
