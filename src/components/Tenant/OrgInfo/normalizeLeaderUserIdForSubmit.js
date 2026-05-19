/**
 * 组织负责人表单项提交值：清空时显式返回 null，避免字段被省略导致无法清除。
 *
 * @param {unknown} value
 * @returns {string | null}
 */
export function normalizeLeaderUserIdForSubmit(value) {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'object') {
    const id = value.id ?? value.value;
    if (id == null || id === '') {
      return null;
    }
    return String(id);
  }
  return String(value);
}
