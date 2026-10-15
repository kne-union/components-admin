export const formatAddress = item => {
  if (!item) {
    return '';
  }
  return item.name ? `${item.name} <${item.address}>` : item.address;
};

export const formatAddressList = list => (list || []).map(formatAddress).join(', ');

export const formatAddressNames = list => (list || []).map(item => item.name || item.address).join(', ');

export const formatSize = size => {
  if (!size && size !== 0) {
    return '';
  }
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

export const prefixSubject = (prefix, subject) => {
  const text = subject || '';
  return text.toLowerCase().startsWith(prefix.toLowerCase()) ? text : `${prefix} ${text}`.trim();
};

const escapeHtml = text =>
  String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const quoteMail = (mail, { formatMessage }) => {
  const date = mail.date ? new Date(mail.date).toLocaleString() : '';
  return [
    '<p><br/></p>',
    `<p>${escapeHtml(formatMessage({ id: 'QuoteHeader' }, { date, from: formatAddress(mail.from?.[0]) }))}</p>`,
    `<blockquote style="margin:0 0 0 8px;padding-left:8px;border-left:2px solid #d9d9d9">${mail.html || escapeHtml(mail.text)}</blockquote>`
  ].join('');
};

export const parseCurrentKey = key => {
  if (key && key.startsWith('label:')) {
    return { folder: 'inbox', labelId: key.slice('label:'.length) };
  }
  return { folder: key || 'inbox', labelId: undefined };
};

export const toFilterObject = value =>
  (Array.isArray(value) ? value : []).reduce((result, item) => {
    const target = Array.isArray(item.value) ? item.value.map(option => option.value) : (item.value?.value ?? item.value);
    if (target !== undefined && target !== null && target !== '') {
      result[item.name] = target;
    }
    return result;
  }, {});
