import get from 'lodash/get';
import set from 'lodash/set';
import unset from 'lodash/unset';
import cloneDeep from 'lodash/cloneDeep';
import uniqBy from 'lodash/uniqBy';
import { findTemplateMatches } from '@kne/message-template';

/** 模板变量：优先用声明的 variables，未声明时从主题与正文中提取 {{ name }} */
export const getTemplateVariables = template => {
  const declared = (Array.isArray(template?.variables) ? template.variables : []).filter(item => item && item.name);
  if (declared.length > 0) {
    return declared;
  }
  const text = [template?.subject, typeof template?.content === 'string' ? template.content : '', ...Object.values(template?.extra || {})]
    .filter(item => typeof item === 'string')
    .join('\n');
  return uniqBy(
    findTemplateMatches(text).map(item => ({ name: item.name })),
    'name'
  );
};

/** 变量示例值组装为渲染数据（支持 a.b 路径） */
export const buildExampleProps = variables =>
  (variables || []).reduce((result, item) => {
    if (item?.name && item.example !== undefined && item.example !== null && item.example !== '') {
      set(result, item.name, item.example);
    }
    return result;
  }, {});

/** 预览渲染数据：有示例值用示例值，否则显示 [变量说明]，与 TemplateEditor 预览一致 */
export const buildPreviewProps = template => {
  const variables = getTemplateVariables(template);
  const props = buildExampleProps(variables);
  variables.forEach(item => {
    if (get(props, item.name) == null) {
      set(props, item.name, `[${item.label || item.name}]`);
    }
  });
  return props;
};

export const getVariableFieldName = index => `var_${index}`;

export const parseJSON = value => {
  if (!value) {
    return {};
  }
  if (typeof value === 'object') {
    return value;
  }
  return JSON.parse(value);
};

/** 发送表单 → props：JSON 编辑器的值打底，逐个变量输入框覆盖 */
export const buildMessageProps = (formData = {}, variables = []) => {
  const props = parseJSON(formData.props);
  variables.forEach((item, index) => {
    const value = formData[getVariableFieldName(index)];
    if (value !== undefined && value !== null && value !== '') {
      set(props, item.name, value);
    }
  });
  return props;
};

const BLOCK_TAG_RE = /\{%-?\s*(if|unless|case|for|endif|endunless|endcase|endfor)\b[\s\S]*?-?%\}/g;

/** 去掉 {% if %} / {% for %} 等块内的内容，只保留无条件输出的部分 */
const stripBlockContent = text => {
  let depth = 0;
  let lastIndex = 0;
  let result = '';
  let match;
  const re = new RegExp(BLOCK_TAG_RE.source, 'g');
  while ((match = re.exec(text)) !== null) {
    if (depth === 0) {
      result += text.slice(lastIndex, match.index);
    }
    depth = Math.max(match[1].startsWith('end') ? depth - 1 : depth + 1, 0);
    lastIndex = match.index + match[0].length;
  }
  return depth === 0 ? result + text.slice(lastIndex) : result;
};

/** 必填变量：在条件 / 循环块之外直接输出的变量；只出现在条件块里的视为可选 */
export const getRequiredVariableNames = template => {
  const text = [template?.subject, typeof template?.content === 'string' ? template.content : '']
    .filter(item => typeof item === 'string')
    .map(stripBlockContent)
    .join('\n');
  return Array.from(new Set(findTemplateMatches(text).map(item => item.name)));
};

const RECIPIENT_SPLIT_RE = /[\s,;，；、]+/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d[\d-]{4,19}$/;

/** 收件人文本 → 去重列表，支持逗号、分号、空白、换行分隔 */
export const parseRecipients = value =>
  Array.from(
    new Set(
      (Array.isArray(value) ? value.filter(item => item != null).join('\n') : String(value || ''))
        .split(RECIPIENT_SPLIT_RE)
        .map(item => item.trim())
        .filter(Boolean)
    )
  );

/** 返回格式不正确的收件人 */
export const getInvalidRecipients = (recipients, isSMS) => recipients.filter(item => !(isSMS ? PHONE_RE : EMAIL_RE).test(item));

/** 同 buildMessageProps，JSON 输入不合法时忽略 JSON 部分（用于输入过程中的实时预览） */
export const safeBuildMessageProps = (formData, variables) => {
  try {
    return buildMessageProps(formData, variables);
  } catch {
    return buildMessageProps(Object.assign({}, formData, { props: '{}' }), variables);
  }
};

const isBlank = value => value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

/** 发送预览数据：未填的必填变量显示 [变量说明]；未填的可选变量置空，避免 render 接口用示例值补上，与实际发送一致 */
export const buildSendPreviewProps = (formData, variables = [], requiredNames = []) => {
  const props = safeBuildMessageProps(formData, variables);
  variables.forEach(item => {
    if (isBlank(get(props, item.name))) {
      set(props, item.name, requiredNames.includes(item.name) ? `[${item.label || item.name}]` : '');
    }
  });
  return props;
};

/** 未填写的必填变量 */
export const getMissingVariables = (props = {}, variables = [], requiredNames = []) =>
  variables.filter(item => requiredNames.includes(item.name) && isBlank(get(props, item.name)));

/**
 * 拆分完整参数：能回填到变量输入框的值放进 fields（含空串，用于清掉旧值），其余留在 restProps，
 * 保证同一变量只有一个来源，清空输入框不会被 JSON 里的旧值覆盖
 */
export const splitMessageProps = (variables = [], props = {}) => {
  const restProps = cloneDeep(props || {});
  const fields = {};
  variables.forEach((item, index) => {
    const value = get(restProps, item.name);
    if (value !== null && typeof value === 'object') {
      return;
    }
    fields[getVariableFieldName(index)] = value === undefined || value === null ? '' : String(value);
    unset(restProps, item.name);
  });
  return { fields, restProps };
};

/** 浏览器 IANA 时区，传给 statistics 接口与 SSE，与后端「今日」划界一致 */
export const getClientIanaTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return '';
  }
};

const unwrapValue = value => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (Object.prototype.hasOwnProperty.call(value, 'value')) {
      return unwrapValue(value.value);
    }
    if (Object.prototype.hasOwnProperty.call(value, 'label')) {
      return unwrapValue(value.label);
    }
  }
  return value;
};

const isEmptyValue = value => value === undefined || value === null || value === '';

export const buildMessageParams = (filterValue = {}, filterKeys = []) => {
  return filterKeys.reduce((result, key) => {
    const value = unwrapValue(filterValue[key]);
    if (!isEmptyValue(value)) {
      result[`filter[${key}]`] = value;
    }
    return result;
  }, {});
};

export const filterMessagePageData = ({ pageData = [], params = {}, filters = {} }) => {
  const currentPage = Number(params.currentPage || 1);
  const perPage = Number(params.perPage || 20);
  const list = pageData.filter(item => {
    return Object.entries(filters).every(([key, filter]) => {
      const value = params[`filter[${key}]`];
      if (isEmptyValue(value)) {
        return true;
      }
      return filter(item, value);
    });
  });

  return {
    totalCount: list.length,
    currentPage,
    perPage,
    pageData: list.slice((currentPage - 1) * perPage, currentPage * perPage)
  };
};
