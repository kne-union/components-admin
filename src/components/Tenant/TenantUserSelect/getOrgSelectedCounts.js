import collectOrgSubtreeIds from './collectOrgSubtreeIds';

const getOrgSelectedCounts = (orgList, selectedList, rootId) => {
  const counts = new Map();

  if (rootId != null) {
    counts.set(String(rootId), 0);
  }
  (orgList || []).forEach(org => {
    counts.set(String(org.id), 0);
  });

  (selectedList || []).forEach(user => {
    const userOrgId = user?.tenantOrgId != null ? String(user.tenantOrgId) : null;
    if (!userOrgId) {
      return;
    }

    if (rootId != null) {
      counts.set(String(rootId), (counts.get(String(rootId)) || 0) + 1);
    }

    (orgList || []).forEach(org => {
      const orgId = String(org.id);
      const subtreeIds = collectOrgSubtreeIds(orgList, org.id);
      if (subtreeIds.includes(userOrgId)) {
        counts.set(orgId, (counts.get(orgId) || 0) + 1);
      }
    });
  });

  return counts;
};

export default getOrgSelectedCounts;
