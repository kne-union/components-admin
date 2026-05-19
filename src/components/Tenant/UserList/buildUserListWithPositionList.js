import merge from 'lodash/merge';
import { extractPositionPageData } from './mapUserOptionsToFormValue';

export function extractListBody(response) {
  return response?.data?.results ?? response?.data?.data ?? response?.data;
}

const collectPositionIds = pageData => {
  const ids = new Set();
  (pageData || []).forEach(item => {
    const raw = item?.options?.position;
    if (raw == null || raw === '') {
      return;
    }
    if (typeof raw === 'object' && raw.id != null) {
      ids.add(String(raw.id));
      return;
    }
    ids.add(String(raw));
  });
  return [...ids];
};

/** 列表接口响应是否已附带 positionList（如 tenant-extra/user-list） */
export function listResponseHasPositionList(listApi) {
  const url = listApi?.url || '';
  return url.includes('tenant-extra') && url.includes('user-list');
}

/**
 * 为租户用户列表附加 positionList，供岗位列展示。
 * 若 list 已是 tenant-extra 富集接口则不再包装。
 */
export function buildUserListWithPositionList(listApi, positionListApi, ajax) {
  if (!listApi || !ajax || !positionListApi?.url || listResponseHasPositionList(listApi)) {
    return listApi;
  }

  return Object.assign({}, listApi, {
    loader: async () => {
      const userRes = await ajax(merge({}, listApi));
      const userBody = extractListBody(userRes) || {};
      const ids = collectPositionIds(userBody.pageData);

      let positionList = [];
      if (ids.length) {
        const posRes = await ajax(
          merge({}, positionListApi, {
            params: merge({}, positionListApi.params || {}, {
              filter: Object.assign({}, positionListApi.params?.filter || {}, { ids }),
              perPage: Math.max(ids.length, 1),
              currentPage: 1
            })
          })
        );
        positionList = extractPositionPageData(posRes);
      }

      return Object.assign({}, userBody, { positionList });
    }
  });
}

/** 根据 positionList 解析岗位展示名称（支持 options.position、顶层 position 字段） */
export function resolvePositionDisplayName(item, positionList) {
  const raw = item?.options?.position ?? item?.position;
  if (raw == null || raw === '') {
    return '';
  }
  if (typeof raw === 'object' && raw.name) {
    return String(raw.name).trim();
  }
  if (typeof raw === 'string' && Number.isNaN(Number(raw))) {
    return raw.trim();
  }
  const id = String(typeof raw === 'object' ? raw.id : raw);
  const hit = (positionList || []).find(p => String(p.id) === id);
  return hit?.name ? String(hit.name) : '';
}
