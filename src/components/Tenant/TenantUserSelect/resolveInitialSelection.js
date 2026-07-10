import { resolveUserOrgId } from './resolveUserOrgId';
import fetchUserList from './fetchUserList';

const findOrgName = (orgList, orgId) => orgList.find(item => String(item.id) === String(orgId))?.name || '';

const resolveInitialSelection = async ({ selected, orgList, userApi }) => {
  if (!selected?.length) {
    return null;
  }

  const enriched = selected.map(item => Object.assign({}, item));
  const needsLookup = enriched.some(item => item.tenantOrgId == null);

  if (needsLookup) {
    const users = await fetchUserList(userApi, {
      perPage: 1000,
      currentPage: 1
    });
    const userById = new Map(users.map(user => [String(user.id), user]));

    enriched.forEach(item => {
      if (item.tenantOrgId != null) {
        return;
      }
      const user = userById.get(String(item.id));
      const orgId = user ? resolveUserOrgId(user) : null;
      if (orgId) {
        item.tenantOrgId = orgId;
      }
    });
  }

  const selectedByOrg = new Map();
  enriched.forEach(item => {
    if (item.tenantOrgId == null) {
      return;
    }
    const orgId = String(item.tenantOrgId);
    selectedByOrg.set(orgId, (selectedByOrg.get(orgId) || 0) + 1);
  });

  if (!selectedByOrg.size) {
    return {
      orgId: null,
      orgName: '',
      enrichedSelected: enriched
    };
  }

  let orgId = null;
  for (const org of orgList || []) {
    const nextOrgId = String(org.id);
    if (selectedByOrg.has(nextOrgId)) {
      orgId = nextOrgId;
      break;
    }
  }

  if (!orgId) {
    orgId = String(enriched.find(item => item.tenantOrgId != null).tenantOrgId);
  }

  return {
    orgId,
    orgName: findOrgName(orgList, orgId),
    enrichedSelected: enriched
  };
};

export default resolveInitialSelection;
