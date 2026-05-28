const getOrgLabel = org => {
  if (org?.name) {
    return String(org.name).trim();
  }
  if (org?.path) {
    const parts = String(org.path)
      .split(/[/／>＞]/)
      .map(s => s.trim())
      .filter(Boolean);
    return parts[parts.length - 1] || String(org.path).trim();
  }
  return '';
};

const getOrgFullPath = org => {
  if (org?.path) {
    return String(org.path).trim();
  }
  return getOrgLabel(org);
};

const buildOrgDisplayItem = (id, org) => {
  const label = getOrgLabel(org);
  if (!label) {
    return null;
  }
  const fullPath = getOrgFullPath(org);
  const path = fullPath || label;
  const showPath = path && label && path !== label;
  return { id, label, fullPath, path, showPath };
};

/** @returns {{ id: string, label: string, fullPath: string, path: string, showPath: boolean }[]} */
const getUserOrgDisplayItems = item => {
  if (Array.isArray(item?.tenantOrgs) && item.tenantOrgs.length) {
    return item.tenantOrgs
      .map((org, index) => buildOrgDisplayItem(org.id != null ? String(org.id) : `org-${index}`, org))
      .filter(Boolean);
  }

  if (item?.tenantOrgPath) {
    const rawPath = String(item.tenantOrgPath).trim();
    const segments = rawPath.split(/[；;]/).map(s => s.trim()).filter(Boolean);
    if (segments.length > 1) {
      return segments
        .map((segment, index) => buildOrgDisplayItem(`path-${index}`, { path: segment }))
        .filter(Boolean);
    }
    return [buildOrgDisplayItem(
      item.tenantOrg?.id != null ? String(item.tenantOrg.id) : 'primary',
      { name: item.tenantOrg?.name, path: rawPath }
    )].filter(Boolean);
  }

  if (item?.tenantOrg?.name) {
    return [buildOrgDisplayItem(String(item.tenantOrg.id ?? 'primary'), item.tenantOrg)].filter(Boolean);
  }

  return [];
};

export default getUserOrgDisplayItems;
