/**
 * 与后端 fastify-tenant `libs/utils/orgImportRows.js` 约定一致
 */
import { read, utils, write } from 'xlsx';

/** 与后端 normalizePhone 规则一致，便于预览与提交一致 */
export function normalizeImportPhone(raw) {
  if (raw == null || String(raw).trim() === '') {
    return null;
  }
  let s = String(raw).trim().replace(/[\s-]/g, '');
  if (!s) {
    return null;
  }
  if (s.startsWith('+')) {
    const digits = s.slice(1).replace(/\D/g, '');
    if (digits.startsWith('86')) {
      return `+86 ${digits.slice(2)}`;
    }
    return s.startsWith('+') ? s.replace(/^\+(\d{1,4})(\d+)$/, (_, cc, rest) => `+${cc} ${rest}`) : s;
  }
  let digits = s.replace(/\D/g, '');
  if (digits.startsWith('0086')) {
    digits = digits.slice(4);
  } else if (digits.startsWith('86') && digits.length > 11) {
    digits = digits.slice(2);
  }
  if (digits.startsWith('0') && digits.length > 10) {
    digits = digits.slice(1);
  }
  return `+86 ${digits}`;
}

const FILE_NAME = '组织导入示例模板.xlsx';
const SHEET_ORG = '组织';
const SHEET_USER = '用户';

const SHEET_ORG_ALIASES = ['组织', '组织导入', 'org', 'orgs', 'organization', '部门'];
const SHEET_USER_ALIASES = ['用户', '用户导入', 'user', 'users', 'member', '成员'];

const ROW_TYPE_KEYS = ['行类型', 'rowType', '类型', 'type'];
const NAME_KEYS = ['组织名称', '部门名称', 'orgName', 'name', '名称'];
const PARENT_KEYS = ['上级组织名称', '上级部门', 'parentOrgName', 'parentName', '上级'];
const USER_NAME_KEYS = ['用户姓名', 'userName', '姓名', '负责人姓名', 'leaderName'];
const EMAIL_KEYS = ['邮箱', 'email', 'Email'];
const PHONE_KEYS = ['手机', '手机号', 'phone', 'Phone'];
const DESC_KEYS = ['描述', '组织描述', 'description'];
const IS_LEADER_KEYS = ['是否负责人', 'isLeader', '负责人'];

function normalizeCell(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const key = String(k || '')
      .trim()
      .replace(/\s+/g, '');
    out[key] = typeof v === 'string' ? v.trim() : v;
  }
  return out;
}

function pickCell(row, keys) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return String(row[k]).trim();
    }
  }
  return '';
}

function normalizeSheetKey(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

function matchSheetName(name, aliases) {
  const key = normalizeSheetKey(name);
  return aliases.some(alias => {
    const a = normalizeSheetKey(alias);
    return key === a || key.includes(a) || a.includes(key);
  });
}

function findSheetName(sheetNames, aliases) {
  return sheetNames.find(n => matchSheetName(n, aliases)) || null;
}

function isRowEmpty(row, fields) {
  return fields.every(f => !f);
}

export function normalizeRowType(raw) {
  const s = String(raw || '')
    .trim()
    .toLowerCase();
  if (!s) {
    return null;
  }
  if (['组织', 'org', 'organization', '部门', 'o'].includes(s) || s.startsWith('组织')) {
    return 'org';
  }
  if (['用户', 'user', 'member', '成员', 'u'].includes(s) || s.startsWith('用户')) {
    return 'user';
  }
  return null;
}

export function parseIsLeader(raw) {
  if (raw == null || raw === '') {
    return false;
  }
  const s = String(raw)
    .trim()
    .toLowerCase();
  return ['是', 'yes', 'y', 'true', '1', '负责人'].includes(s);
}

function parseOrgSheetRow(raw) {
  const row = normalizeCell(raw);
  const orgName = pickCell(row, NAME_KEYS);
  const parentOrgName = pickCell(row, PARENT_KEYS) || null;
  const description = pickCell(row, DESC_KEYS) || null;
  if (isRowEmpty(row, [orgName, parentOrgName, description])) {
    return null;
  }
  return {
    rowType: 'org',
    orgName,
    parentOrgName,
    userName: null,
    email: null,
    phone: null,
    description,
    isLeader: false
  };
}

function parseUserSheetRow(raw) {
  const row = normalizeCell(raw);
  const orgName = pickCell(row, NAME_KEYS);
  const userName = pickCell(row, USER_NAME_KEYS) || null;
  const email = pickCell(row, EMAIL_KEYS) || null;
  let phone = pickCell(row, PHONE_KEYS) || null;
  if (phone) {
    phone = normalizeImportPhone(phone);
  }
  const description = pickCell(row, DESC_KEYS) || null;
  const isLeader = parseIsLeader(pickCell(row, IS_LEADER_KEYS));
  if (isRowEmpty(row, [orgName, userName, email, phone, description])) {
    return null;
  }
  return {
    rowType: 'user',
    orgName,
    parentOrgName: null,
    userName,
    email,
    phone,
    description,
    isLeader
  };
}

function parseLegacySingleSheetRow(raw) {
  const row = normalizeCell(raw);
  const rowTypeRaw = pickCell(row, ROW_TYPE_KEYS);
  const rowType = normalizeRowType(rowTypeRaw);
  const userName = pickCell(row, USER_NAME_KEYS) || null;
  const orgName = pickCell(row, NAME_KEYS) || '';
  const parentOrgName = pickCell(row, PARENT_KEYS) || null;
  const email = pickCell(row, EMAIL_KEYS) || null;
  const phone = pickCell(row, PHONE_KEYS) || null;
  const description = pickCell(row, DESC_KEYS) || null;
  const isLeader = parseIsLeader(pickCell(row, IS_LEADER_KEYS));
  if (isRowEmpty(row, [rowTypeRaw, orgName, parentOrgName, userName, email, phone, description])) {
    return null;
  }
  return {
    rowType: rowType || rowTypeRaw || '',
    orgName,
    parentOrgName,
    userName,
    email,
    phone,
    description,
    isLeader
  };
}

function sheetHasRowTypeColumn(sheet) {
  const rawRows = utils.sheet_to_json(sheet, { defval: '', header: 1 });
  if (!rawRows.length) {
    return false;
  }
  const headerRow = rawRows[0];
  return headerRow.some(cell => {
    const key = normalizeSheetKey(cell);
    return ROW_TYPE_KEYS.some(alias => normalizeSheetKey(alias) === key || key.includes(normalizeSheetKey(alias)));
  });
}

function resolveWorkbookSheets(workbook) {
  const names = workbook.SheetNames || [];
  if (!names.length) {
    return { mode: 'none' };
  }

  const orgName = findSheetName(names, SHEET_ORG_ALIASES);
  const userName = findSheetName(names, SHEET_USER_ALIASES);

  if (orgName || userName) {
    return {
      mode: 'multi',
      orgName: orgName || (names.length >= 2 && userName && names[0] !== userName ? names[0] : null),
      userName: userName || (names.length >= 2 && orgName && names[1] !== orgName ? names[1] : null)
    };
  }

  if (names.length >= 2) {
    return { mode: 'multi', orgName: names[0], userName: names[1] };
  }

  const only = names[0];
  if (sheetHasRowTypeColumn(workbook.Sheets[only])) {
    return { mode: 'legacy', sheetName: only };
  }

  return { mode: 'multi', orgName: only, userName: null };
}

function parseWorkbook(workbook) {
  const resolved = resolveWorkbookSheets(workbook);
  const rows = [];

  if (resolved.mode === 'none') {
    throw new Error('Excel 中没有任何工作表');
  }

  if (resolved.mode === 'legacy') {
    const rawRows = utils.sheet_to_json(workbook.Sheets[resolved.sheetName], { defval: '' });
    rawRows.forEach(raw => {
      const parsed = parseLegacySingleSheetRow(raw);
      if (parsed) {
        rows.push(parsed);
      }
    });
    return rows;
  }

  if (resolved.orgName) {
    const rawRows = utils.sheet_to_json(workbook.Sheets[resolved.orgName], { defval: '' });
    rawRows.forEach(raw => {
      const parsed = parseOrgSheetRow(raw);
      if (parsed) {
        rows.push(parsed);
      }
    });
  }

  if (resolved.userName) {
    const rawRows = utils.sheet_to_json(workbook.Sheets[resolved.userName], { defval: '' });
    rawRows.forEach(raw => {
      const parsed = parseUserSheetRow(raw);
      if (parsed) {
        rows.push(parsed);
      }
    });
  }

  return rows;
}

/**
 * @param {File} file
 * @returns {Promise<Array<{ rowType: 'org'|'user', orgName: string, parentOrgName: string|null, userName: string|null, email: string|null, phone: string|null, description: string|null, isLeader: boolean }>>}
 */
export function parseOrgImportExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: 'array' });
        const rows = parseWorkbook(workbook);
        if (!rows.length) {
          reject(new Error('Excel 中没有可导入的数据行（请填写「组织」或「用户」工作表）'));
          return;
        }
        resolve(rows);
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file);
  });
}

export function buildOrgImportTemplateBuffer() {
  const orgRows = [
    ['组织名称', '上级组织名称', '描述'],
    ['示例研发中心', '', '挂到导入时所选锚点下的第一行示例'],
    ['示例前端组', '示例研发中心', '']
  ];
  const userRows = [
    ['组织名称', '用户姓名', '邮箱', '手机', '是否负责人'],
    ['示例前端组', '张三', 'zhangsan@example.com', '13800000001', '是'],
    ['示例前端组', '李四', 'lisi@example.com', '', '']
  ];

  const wsOrg = utils.aoa_to_sheet(orgRows);
  wsOrg['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 36 }];

  const wsUser = utils.aoa_to_sheet(userRows);
  wsUser['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 26 }, { wch: 14 }, { wch: 12 }];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, wsOrg, SHEET_ORG);
  utils.book_append_sheet(wb, wsUser, SHEET_USER);
  return write(wb, { type: 'array', bookType: 'xlsx' });
}

function resolveRowType(row) {
  if (row.rowType === 'org' || row.rowType === 'user') {
    return row.rowType;
  }
  return normalizeRowType(row.rowType);
}

/** 将扁平导入行按组织聚合，供预览主表 + 用户子表展示 */
export function buildImportPreviewGroups(rows) {
  if (!rows?.length) {
    return [];
  }
  const groups = [];
  const orgNameToGroup = new Map();

  rows.forEach((row, index) => {
    if (resolveRowType(row) !== 'org') {
      return;
    }
    const group = {
      key: `org-row-${index}`,
      orgName: row.orgName || '',
      parentOrgName: row.parentOrgName || null,
      description: row.description || null,
      orgRowIndex: index,
      rowIndices: [index],
      users: [],
      orgInSheet: true
    };
    groups.push(group);
    if (row.orgName) {
      orgNameToGroup.set(row.orgName, group);
    }
  });

  rows.forEach((row, index) => {
    if (resolveRowType(row) !== 'user') {
      return;
    }
    const userEntry = {
      key: `user-row-${index}`,
      rowIndex: index,
      userName: row.userName,
      email: row.email,
      phone: row.phone,
      isLeader: row.isLeader,
      description: row.description
    };
    const group = row.orgName ? orgNameToGroup.get(row.orgName) : null;
    if (group) {
      group.users.push(userEntry);
      group.rowIndices.push(index);
      return;
    }
    const orphanKey = `__ref__${row.orgName || ''}`;
    let refGroup = orgNameToGroup.get(orphanKey);
    if (!refGroup) {
      refGroup = {
        key: `org-ref-${orphanKey}`,
        orgName: row.orgName || '—',
        parentOrgName: null,
        description: null,
        orgRowIndex: null,
        rowIndices: [],
        users: [],
        orgInSheet: false
      };
      groups.push(refGroup);
      orgNameToGroup.set(orphanKey, refGroup);
    }
    refGroup.users.push(userEntry);
    refGroup.rowIndices.push(index);
  });

  return groups;
}

export function prepareImportRowsForSubmit(rows, { rowIndexOffset = 0 } = {}) {
  return rows.map((row, index) => {
    const rowType =
      row.rowType === 'org' || row.rowType === 'user' ? row.rowType : normalizeRowType(row.rowType);
    if (!rowType) {
      throw new Error(`第 ${rowIndexOffset + index + 1} 行：无效行类型「${row.rowType || ''}」，请使用「组织」「用户」两个工作表`);
    }
    const userName = row.userName ? String(row.userName).trim() : null;
    let phone = row.phone ? String(row.phone).trim() : null;
    if (phone) {
      phone = normalizeImportPhone(phone);
    }
    return {
      rowType,
      orgName: row.orgName ? String(row.orgName).trim() : null,
      parentOrgName: row.parentOrgName ? String(row.parentOrgName).trim() : null,
      userName,
      leaderName: userName,
      email: row.email ? String(row.email).trim() : null,
      phone,
      description: row.description ? String(row.description).trim() : null,
      isLeader: Boolean(row.isLeader)
    };
  });
}

export function downloadOrgImportTemplate() {
  const buf = buildOrgImportTemplateBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = FILE_NAME;
  a.rel = 'noopener';
  a.click();
  URL.revokeObjectURL(url);
}
