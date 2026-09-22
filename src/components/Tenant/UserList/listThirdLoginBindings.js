/**
 * Parse options.thirdLogin as platform → { sourceId, boundAt } map only.
 * @returns {{ platform: string, sourceId: string, boundAt: string|null }[]}
 */
const listThirdLoginBindings = options => {
  const thirdLogin = options && options.thirdLogin;
  if (!thirdLogin || typeof thirdLogin !== 'object' || Array.isArray(thirdLogin)) {
    return [];
  }
  return Object.keys(thirdLogin)
    .map(platform => {
      const entry = thirdLogin[platform];
      if (!entry || entry.sourceId == null || entry.sourceId === '') {
        return null;
      }
      return {
        platform: String(platform),
        sourceId: String(entry.sourceId),
        boundAt: entry.boundAt || null
      };
    })
    .filter(Boolean);
};

const listRemovableThirdLoginBindings = (options, syncSource) => {
  const locked = syncSource ? String(syncSource) : null;
  return listThirdLoginBindings(options).filter(item => !locked || item.platform !== locked);
};

export { listThirdLoginBindings, listRemovableThirdLoginBindings };
export default listThirdLoginBindings;
