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

/** @returns {{ id: string, label: string, fullPath: string }[]} */
const getUserOrgDisplayItems = item => {
  if (Array.isArray(item?.tenantOrgs) && item.tenantOrgs.length) {
    return item.tenantOrgs
      .map((org, index) => {
        const id = org.id != null ? String(org.id) : `org-${index}`;
        const label = getOrgLabel(org);
        if (!label) {
          return null;
        }
        return {
          id,
          label,
          fullPath: getOrgFullPath(org)
        };
      })
      .filter(Boolean);
  }

  if (item?.tenantOrgPath) {
    const path = String(item.tenantOrgPath).trim();
    const segments = path.split(/[；;]/).map(s => s.trim()).filter(Boolean);
    if (segments.length > 1) {
      return segments.map((segment, index) => ({
        id: `path-${index}`,
        label: getOrgLabel({ path: segment }),
        fullPath: segment
      }));
    }
    return [
      {
        id: item.tenantOrg?.id != null ? String(item.tenantOrg.id) : 'primary',
        label: item.tenantOrg?.name || getOrgLabel({ path }),
        fullPath: path
      }
    ];
  }

  if (item?.tenantOrg?.name) {
    return [
      {
        id: String(item.tenantOrg.id ?? 'primary'),
        label: String(item.tenantOrg.name).trim(),
        fullPath: getOrgFullPath(item.tenantOrg)
      }
    ];
  }

  return [];
};

export default getUserOrgDisplayItems;
