import { getPublicPath } from '@kne/remote-loader';
import { filterPageData } from '@components/MessageQueue/utils';
import mailGatewayData from './mail-gateway-data.json';

const state = JSON.parse(JSON.stringify(mailGatewayData));

const createId = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const now = () => new Date().toISOString();
const findById = (list, id) => list.find(item => String(item.id) === String(id));
const toBoolean = value => value === true || value === 'true';
const includesText = (source, keyword) =>
  String(source || '')
    .toLowerCase()
    .includes(String(keyword).toLowerCase());
const stripHtml = html =>
  String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const parseAddressList = value => {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value
      .flatMap(item => (typeof item === 'string' ? parseAddressList(item) : [{ name: item.name || '', address: item.address }]))
      .filter(item => item.address);
  }
  return String(value)
    .split(/[,;，；]/)
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => {
      const matched = item.match(/^(.*)<([^>]+)>$/);
      return matched ? { name: matched[1].trim().replace(/^"|"$/g, ''), address: matched[2].trim() } : { name: '', address: item };
    });
};

const escapeHtml = text => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const renderTemplate = (template, context, { html = false } = {}) =>
  String(template || '').replace(/{{\s*([\w.[\]]+)\s*}}/g, (match, path) => {
    const value = path
      .replace(/\[(\w+)\]/g, '.$1')
      .split('.')
      .reduce((current, key) => (current == null ? undefined : current[key]), context);
    if (value == null) {
      return '';
    }
    const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return html ? escapeHtml(text) : text;
  });

const withTemplateCategory = template => {
  if (!template) {
    return template;
  }
  const category = findById(state.templateCategories, template.categoryId);
  return Object.assign({}, template, { category: category ? { id: category.id, name: category.name } : null });
};

const getLabels = mail => (mail.labelIds || []).map(id => findById(state.labels, id)).filter(Boolean);

const toMailListItem = mail => {
  const { html, labelIds, ...rest } = mail;
  return Object.assign({}, rest, {
    summary: stripHtml(html).slice(0, 120),
    labels: getLabels(mail).map(({ id, name, color }) => ({ id, name, color }))
  });
};

const toMailDetail = mail => {
  const { labelIds, ...rest } = mail;
  return Object.assign({}, rest, {
    labels: getLabels(mail).map(({ id, name, color }) => ({ id, name, color }))
  });
};

const sortByDateDesc = list => list.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

// 模拟首次下载附件：mock 的 file.getUrl 直接把 id 当地址，这里用 components-core 自带的示例文件
const getMockFileUrl = attachment => {
  const base = `${getPublicPath('components-core')}/mock`;
  return /^image\//.test(attachment.contentType || '') ? `${base}/resume.png` : `${base}/resume.pdf`;
};

const downloadAttachment = ({ id, index }) => {
  const mail = findById(state.mails, id);
  const attachment = mail && (mail.attachments || [])[index];
  if (!attachment) {
    return null;
  }
  if (!attachment.id && !attachment.url) {
    attachment.id = getMockFileUrl(attachment);
  }
  return attachment;
};

const prepareAttachments = attachments =>
  (attachments || []).map(item =>
    !item.id && !item.url && item.mailId != null ? downloadAttachment({ id: item.mailId, index: Number(item.index) }) || item : item
  );

const getAccount = id => findById(state.accounts, id) || state.accounts[0];

const buildComposeMail = (data, folder) => {
  const account = getAccount(data.accountId);
  return {
    accountId: account.id,
    folder,
    from: [{ name: account.name, address: account.address }],
    to: parseAddressList(data.to),
    cc: parseAddressList(data.cc),
    bcc: parseAddressList(data.bcc),
    subject: data.subject || '',
    html: data.html || '',
    inReplyTo: data.inReplyTo,
    references: data.references,
    date: now(),
    isRead: true,
    isStarred: false,
    attachments: data.attachments || [],
    labelIds: []
  };
};

const sendMail = (data, draftId) => {
  const attachments = prepareAttachments(data.attachments);
  const mail = Object.assign(buildComposeMail(Object.assign({}, data, { attachments }), 'sent'), {
    messageId: `<${Date.now()}@${getAccount(data.accountId).address.split('@')[1]}>`
  });
  if (draftId) {
    const draft = findById(state.mails, draftId);
    if (draft) {
      Object.assign(draft, mail);
      return toMailDetail(draft);
    }
  }
  const created = Object.assign({ id: createId('mail') }, mail);
  state.mails.push(created);
  return toMailDetail(created);
};

const evaluateCondition = (mail, item) => {
  const getText = () => {
    switch (item.field) {
      case 'from':
      case 'to':
      case 'cc':
        return (mail[item.field] || []).map(({ name, address }) => (name ? `${name} <${address}>` : address)).join(', ');
      case 'subject':
        return mail.subject || '';
      case 'text':
        return stripHtml(mail.html);
      case 'hasAttachment':
        return String((mail.attachments || []).length > 0);
      case 'accountId':
        return String(mail.accountId || '');
      default:
        return '';
    }
  };
  const text = getText().toLowerCase();
  const target = String(item.value == null ? '' : item.value).toLowerCase();
  switch (item.operator) {
    case 'contains':
      return text.includes(target);
    case 'notContains':
      return !text.includes(target);
    case 'equals':
      if (['from', 'to', 'cc'].includes(item.field)) {
        return (mail[item.field] || []).some(({ address }) => String(address).toLowerCase() === target);
      }
      return text === target;
    case 'startsWith':
      return text.startsWith(target);
    case 'endsWith':
      return text.endsWith(target);
    case 'regex':
      try {
        return new RegExp(String(item.value), 'i').test(getText());
      } catch (e) {
        return false;
      }
    default:
      return false;
  }
};

const AI_STOP_WORDS = ['邮件', '这封', '封邮', '是否', '否是', '是不', '不是', '或者'];

// 模拟宿主注册的 AI 判断：取判断要求里的中文双字词 / 英文单词，在邮件中出现即视为命中
const evaluateExtensionCondition = (mail, item) => {
  if (item.type !== 'aiJudge') {
    return { matched: false, error: `条件类型 ${item.type} 未注册` };
  }
  const { prompt = '', scope = 'all' } = item.params || {};
  const text = `${mail.subject || ''} ${scope === 'subject' ? '' : stripHtml(mail.html)}`.toLowerCase();
  const words = new Set();
  String(prompt)
    .toLowerCase()
    .split(/[^\u4e00-\u9fa5a-z0-9]+/)
    .forEach(chunk => {
      if (/^[a-z0-9]+$/.test(chunk)) {
        chunk.length > 2 && words.add(chunk);
        return;
      }
      for (let index = 0; index < chunk.length - 1; index++) {
        words.add(chunk.slice(index, index + 2));
      }
    });
  const hits = Array.from(words).filter(word => !AI_STOP_WORDS.includes(word) && text.includes(word));
  return hits.length > 0
    ? { matched: true, reason: `（模拟）邮件内容与判断要求相关：${hits.join('、')}` }
    : { matched: false, reason: '（模拟）邮件内容与判断要求无关' };
};

const normalizeAddress = address =>
  String(address || '')
    .trim()
    .toLowerCase();

const checkContactAddress = (address, excludeId) => {
  const exists = state.contacts.find(item => item.address === address && String(item.id) !== String(excludeId));
  return exists ? { code: 409, msg: `联系人 ${address} 已存在` } : null;
};

const mailGatewayMock = {
  account: {
    list: {
      loader: ({ params }) =>
        filterPageData({
          pageData: state.accounts,
          params,
          filters: {
            id: (item, value) => String(item.id) === String(value),
            keyword: (item, value) => includesText(item.name, value) || includesText(item.address, value),
            status: (item, value) => item.status === value
          }
        })
    },
    detail: {
      loader: ({ urlParams }) => findById(state.accounts, urlParams?.id)
    },
    create: {
      loader: ({ data }) => {
        const { password, skipVerify, ...rest } = data || {};
        const account = Object.assign(
          {
            id: createId('acc'),
            status: 'enabled',
            isDefault: state.accounts.length === 0,
            syncState: null,
            lastSyncAt: null,
            lastError: null,
            createdAt: now()
          },
          rest
        );
        state.accounts.push(account);
        return account;
      }
    },
    save: {
      loader: ({ urlParams, data }) => {
        const account = findById(state.accounts, urlParams?.id);
        const { password, skipVerify, id, ...rest } = data || {};
        account && Object.assign(account, rest);
        return account;
      }
    },
    remove: {
      loader: ({ urlParams }) => {
        const removed = findById(state.accounts, urlParams?.id);
        state.accounts = state.accounts.filter(item => String(item.id) !== String(urlParams?.id));
        if (removed?.isDefault && state.accounts[0]) {
          state.accounts[0].isDefault = true;
        }
        state.mails = state.mails.filter(item => String(item.accountId) !== String(urlParams?.id));
        state.labels = state.labels.filter(item => String(item.accountId) !== String(urlParams?.id));
        return {};
      }
    },
    setStatus: {
      loader: ({ urlParams, data }) => {
        const account = findById(state.accounts, urlParams?.id);
        account && Object.assign(account, { status: data?.status });
        return account;
      }
    },
    setDefault: {
      loader: ({ urlParams }) => {
        state.accounts.forEach(item => {
          item.isDefault = String(item.id) === String(urlParams?.id);
        });
        return findById(state.accounts, urlParams?.id);
      }
    },
    testConnection: {
      loader: ({ data }) => {
        if (data?.password === 'wrong-password') {
          return {
            success: false,
            imap: { success: false, error: 'Invalid credentials (Failure)' },
            smtp: { success: false, error: 'Invalid login: 535 Error: authentication failed' }
          };
        }
        return { success: true, imap: { success: true }, smtp: { success: true } };
      }
    },
    sync: {
      loader: ({ urlParams }) => {
        const account = findById(state.accounts, urlParams?.id);
        account && Object.assign(account, { lastSyncAt: now(), lastError: null });
        return { skipped: false, count: 0, hasMore: false };
      }
    }
  },
  mail: {
    list: {
      loader: ({ params }) => {
        const result = filterPageData({
          pageData: sortByDateDesc(state.mails),
          params: Object.assign({}, params, {
            filter: Object.assign({ folder: 'inbox' }, params?.filter)
          }),
          filters: {
            accountId: (item, value) => String(item.accountId) === String(value),
            folder: (item, value) => item.folder === value,
            labelId: (item, value) => (item.labelIds || []).map(String).includes(String(value)),
            isRead: (item, value) => item.isRead === toBoolean(value),
            isStarred: (item, value) => item.isStarred === toBoolean(value),
            keyword: (item, value) => includesText(item.subject, value) || includesText(stripHtml(item.html), value)
          }
        });
        return Object.assign({}, result, { pageData: result.pageData.map(toMailListItem) });
      }
    },
    stats: {
      loader: ({ params }) => {
        const mails = state.mails.filter(item => !params?.accountId || String(item.accountId) === String(params.accountId));
        const countFolder = folder => {
          const list = mails.filter(item => item.folder === folder);
          return { total: list.length, unread: list.filter(item => !item.isRead).length };
        };
        const inbox = mails.filter(item => item.folder === 'inbox');
        const labels = state.labels
          .filter(label => !label.accountId || !params?.accountId || String(label.accountId) === String(params.accountId))
          .sort((a, b) => a.sort - b.sort)
          .map(label => {
            const list = inbox.filter(item => (item.labelIds || []).map(String).includes(String(label.id)));
            return Object.assign({}, label, { total: list.length, unread: list.filter(item => !item.isRead).length });
          });
        return {
          folders: {
            inbox: countFolder('inbox'),
            sent: { total: countFolder('sent').total },
            draft: { total: countFolder('draft').total },
            trash: { total: countFolder('trash').total }
          },
          labels
        };
      }
    },
    detail: {
      loader: ({ urlParams, params }) => {
        const mail = findById(state.mails, urlParams?.id);
        if (!mail) {
          return null;
        }
        if (params?.markRead !== false) {
          mail.isRead = true;
        }
        return toMailDetail(mail);
      }
    },
    downloadAttachment: {
      loader: ({ urlParams }) => downloadAttachment({ id: urlParams?.id, index: Number(urlParams?.index) })
    },
    read: {
      loader: ({ data }) => {
        (data?.ids || []).forEach(id => {
          const mail = findById(state.mails, id);
          mail && (mail.isRead = data.isRead !== false);
        });
        return {};
      }
    },
    star: {
      loader: ({ data }) => {
        (data?.ids || []).forEach(id => {
          const mail = findById(state.mails, id);
          mail && (mail.isStarred = data.isStarred !== false);
        });
        return {};
      }
    },
    setLabels: {
      loader: ({ urlParams, data }) => {
        const mail = findById(state.mails, urlParams?.id);
        mail && (mail.labelIds = (data?.labelIds || []).map(String));
        return {};
      }
    },
    trash: {
      loader: ({ data }) => {
        (data?.ids || []).forEach(id => {
          const mail = findById(state.mails, id);
          if (mail && mail.folder !== 'trash') {
            Object.assign(mail, { originFolder: mail.folder, folder: 'trash' });
          }
        });
        return {};
      }
    },
    restore: {
      loader: ({ data }) => {
        (data?.ids || []).forEach(id => {
          const mail = findById(state.mails, id);
          if (mail && mail.folder === 'trash') {
            Object.assign(mail, { folder: mail.originFolder || 'inbox', originFolder: null });
          }
        });
        return {};
      }
    },
    remove: {
      loader: ({ data }) => {
        const ids = (data?.ids || []).map(String);
        state.mails = state.mails.filter(item => !ids.includes(String(item.id)));
        return {};
      }
    },
    send: {
      loader: ({ data }) => sendMail(data || {})
    }
  },
  draft: {
    create: {
      loader: ({ data }) => {
        const draft = Object.assign({ id: createId('mail') }, buildComposeMail(data || {}, 'draft'));
        state.mails.push(draft);
        return toMailDetail(draft);
      }
    },
    save: {
      loader: ({ urlParams, data }) => {
        const draft = findById(state.mails, urlParams?.id);
        draft && Object.assign(draft, buildComposeMail(Object.assign({ accountId: draft.accountId }, data), 'draft'));
        return draft ? toMailDetail(draft) : null;
      }
    },
    remove: {
      loader: ({ urlParams }) => {
        state.mails = state.mails.filter(item => String(item.id) !== String(urlParams?.id));
        return {};
      }
    },
    send: {
      loader: ({ urlParams, data }) => {
        const draft = findById(state.mails, urlParams?.id);
        const merged = Object.assign({ accountId: draft?.accountId, to: draft?.to, cc: draft?.cc, subject: draft?.subject, html: draft?.html }, data);
        return sendMail(merged, urlParams?.id);
      }
    }
  },
  label: {
    list: {
      loader: ({ params }) =>
        state.labels
          .filter(item => !item.accountId || !params?.accountId || String(item.accountId) === String(params.accountId))
          .sort((a, b) => a.sort - b.sort)
    },
    create: {
      loader: ({ data }) => {
        const label = Object.assign({ id: createId('lb'), accountId: null, sort: state.labels.length }, data);
        state.labels.push(label);
        return label;
      }
    },
    save: {
      loader: ({ urlParams, data }) => {
        const label = findById(state.labels, urlParams?.id);
        const { id, ...rest } = data || {};
        label && Object.assign(label, rest);
        return label;
      }
    },
    remove: {
      loader: ({ urlParams }) => {
        const id = String(urlParams?.id);
        state.labels = state.labels.filter(item => String(item.id) !== id);
        state.mails.forEach(mail => {
          mail.labelIds = (mail.labelIds || []).filter(labelId => String(labelId) !== id);
        });
        return {};
      }
    },
    sort: {
      loader: ({ data }) => {
        (data?.ids || []).forEach((id, index) => {
          const label = findById(state.labels, id);
          label && (label.sort = index);
        });
        return {};
      }
    }
  },
  rule: {
    list: {
      loader: ({ params }) =>
        filterPageData({
          pageData: state.rules.slice().sort((a, b) => a.priority - b.priority),
          params,
          filters: {
            keyword: (item, value) => includesText(item.name, value) || includesText(item.description, value),
            direction: (item, value) => item.direction === value,
            status: (item, value) => item.status === value
          }
        })
    },
    options: {
      loader: () => state.ruleOptions
    },
    detail: {
      loader: ({ urlParams }) => findById(state.rules, urlParams?.id)
    },
    create: {
      loader: ({ data }) => {
        const rule = Object.assign({ id: createId('rule'), priority: state.rules.length, status: 'enabled', createdAt: now() }, data);
        state.rules.push(rule);
        return rule;
      }
    },
    save: {
      loader: ({ urlParams, data }) => {
        const rule = findById(state.rules, urlParams?.id);
        const { id, ...rest } = data || {};
        rule && Object.assign(rule, rest);
        return rule;
      }
    },
    remove: {
      loader: ({ urlParams }) => {
        state.rules = state.rules.filter(item => String(item.id) !== String(urlParams?.id));
        return {};
      }
    },
    setStatus: {
      loader: ({ urlParams, data }) => {
        const rule = findById(state.rules, urlParams?.id);
        rule && Object.assign(rule, { status: data?.status });
        return rule;
      }
    },
    sort: {
      loader: ({ data }) => {
        (data?.ids || []).forEach((id, index) => {
          const rule = findById(state.rules, id);
          rule && (rule.priority = index);
        });
        return {};
      }
    },
    test: {
      loader: ({ data }) => {
        const rule = data?.id ? findById(state.rules, data.id) : null;
        const conditions = data?.conditions || rule?.conditions || { match: 'all', items: [] };
        const accountIds = data?.accountIds || rule?.accountIds || [];
        const mail = findById(state.mails, data?.mailId);
        if (!mail) {
          return { matched: false, accountMatched: false, details: [] };
        }
        const items = conditions.items || [];
        const isDecided = matched => (conditions.match === 'any' ? matched : !matched);
        const details = items.map(item => (item.type ? null : Object.assign({}, item, { matched: evaluateCondition(mail, item) })));
        let decided = details.some(item => item && isDecided(item.matched));
        items.forEach((item, index) => {
          if (!item.type) {
            return;
          }
          const label = state.customConditions.find(meta => meta.type === item.type)?.label || item.type;
          if (decided) {
            details[index] = Object.assign({}, item, { label, matched: false, skipped: true });
            return;
          }
          details[index] = Object.assign({}, item, { label }, evaluateExtensionCondition(mail, item));
          decided = isDecided(details[index].matched);
        });
        const evaluated = details.filter(item => !item.skipped);
        const conditionMatched =
          details.length === 0 || (conditions.match === 'any' ? evaluated.some(item => item.matched) : evaluated.every(item => item.matched));
        const accountMatched = accountIds.length === 0 || accountIds.map(String).includes(String(mail.accountId));
        return { matched: conditionMatched && accountMatched, accountMatched, details };
      }
    }
  },
  ruleLog: {
    list: {
      loader: ({ params }) => {
        const result = filterPageData({
          pageData: state.ruleLogs.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
          params,
          filters: {
            ruleId: (item, value) => String(item.ruleId) === String(value),
            mailId: (item, value) => String(item.mailId) === String(value),
            accountId: (item, value) => String(item.accountId) === String(value),
            direction: (item, value) => item.direction === value,
            status: (item, value) => item.status === value
          }
        });
        return Object.assign({}, result, {
          pageData: result.pageData.map(item => {
            const rule = findById(state.rules, item.ruleId);
            const mail = findById(state.mails, item.mailId);
            return Object.assign({}, item, {
              rule: rule ? { id: rule.id, name: rule.name } : null,
              mail: mail ? { id: mail.id, subject: mail.subject, from: mail.from } : null
            });
          })
        });
      }
    }
  },
  action: {
    list: {
      loader: ({ params }) => state.actions.filter(item => !params?.direction || item.directions.includes(params.direction))
    }
  },
  templateCategory: {
    list: {
      loader: () => {
        const countOf = categoryId => state.templates.filter(item => String(item.categoryId ?? '') === String(categoryId ?? '')).length;
        const pageData = state.templateCategories
          .slice()
          .sort((a, b) => a.sort - b.sort)
          .map(item => Object.assign({}, item, { templateCount: countOf(item.id) }));
        return { pageData, totalCount: pageData.length, uncategorizedCount: countOf(null) };
      }
    },
    create: {
      loader: ({ data }) => {
        const category = Object.assign({ id: createId('tc'), sort: state.templateCategories.length, createdAt: now() }, data, { level: 1 });
        state.templateCategories.push(category);
        return category;
      }
    },
    save: {
      loader: ({ urlParams, data }) => {
        const category = findById(state.templateCategories, urlParams?.id);
        category && Object.assign(category, data);
        return category;
      }
    },
    remove: {
      loader: ({ urlParams }) => {
        state.templates.forEach(item => {
          String(item.categoryId) === String(urlParams?.id) && (item.categoryId = null);
        });
        state.templateCategories = state.templateCategories.filter(item => String(item.id) !== String(urlParams?.id));
        return {};
      }
    },
    sort: {
      loader: ({ data }) => {
        (data?.ids || []).forEach((id, index) => {
          const category = findById(state.templateCategories, id);
          category && (category.sort = index);
        });
        return {};
      }
    }
  },
  template: {
    list: {
      loader: ({ params }) => {
        const result = filterPageData({
          pageData: state.templates.slice().sort((a, b) => a.sort - b.sort || new Date(b.createdAt) - new Date(a.createdAt)),
          params,
          filters: {
            categoryId: (item, value) => (value === 'none' ? !item.categoryId : String(item.categoryId) === String(value)),
            status: (item, value) => item.status === value,
            level: (item, value) => Number(item.level ?? 1) === Number(value),
            keyword: (item, value) => includesText(item.name, value) || includesText(item.subject, value)
          }
        });
        return Object.assign({}, result, { pageData: result.pageData.map(withTemplateCategory) });
      }
    },
    detail: {
      loader: ({ urlParams }) => withTemplateCategory(findById(state.templates, urlParams?.id))
    },
    create: {
      loader: ({ data }) => {
        const template = Object.assign({ id: createId('tpl'), status: 'enabled', sort: 0, createdAt: now() }, data, {
          categoryId: data?.categoryId || null,
          level: 1
        });
        state.templates.push(template);
        return template;
      }
    },
    save: {
      loader: ({ urlParams, data }) => {
        const template = findById(state.templates, urlParams?.id);
        template && Object.assign(template, data);
        return template;
      }
    },
    remove: {
      loader: ({ urlParams }) => {
        state.templates = state.templates.filter(item => String(item.id) !== String(urlParams?.id));
        return {};
      }
    },
    setStatus: {
      loader: ({ urlParams, data }) => {
        const template = findById(state.templates, urlParams?.id);
        template && Object.assign(template, { status: data?.status });
        return template;
      }
    },
    copy: {
      loader: ({ urlParams }) => {
        const source = findById(state.templates, urlParams?.id);
        const template = Object.assign({}, source, {
          id: createId('tpl'),
          name: `${source?.name}（副本）`,
          status: 'disabled',
          code: null,
          level: 1,
          createdAt: now()
        });
        state.templates.push(template);
        return template;
      }
    },
    render: {
      loader: ({ data }) => {
        const target = data?.template || findById(state.templates, data?.id) || {};
        const mail = data?.mailId ? findById(state.mails, data.mailId) : null;
        const account = findById(state.accounts, data?.accountId || mail?.accountId);
        const context = Object.assign({}, data?.data, mail ? { mail } : {}, account ? { account } : {});
        return { subject: renderTemplate(target.subject, context), html: renderTemplate(target.html, context, { html: true }) };
      }
    }
  },
  contact: {
    list: {
      loader: ({ params }) =>
        filterPageData({
          pageData: state.contacts.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
          params,
          filters: {
            keyword: (item, value) => includesText(item.name, value) || includesText(item.address, value),
            address: (item, value) => item.address === normalizeAddress(value)
          }
        })
    },
    create: {
      loader: ({ data }) => {
        const address = normalizeAddress(data?.address);
        const error = checkContactAddress(address);
        if (error) {
          return error;
        }
        const contact = Object.assign({ id: createId('ct'), name: '', remark: '', createdAt: now() }, data, { address });
        state.contacts.push(contact);
        return contact;
      }
    },
    save: {
      loader: ({ urlParams, data }) => {
        const contact = findById(state.contacts, urlParams?.id);
        const { id, ...rest } = data || {};
        if (rest.address !== undefined) {
          rest.address = normalizeAddress(rest.address);
          const error = checkContactAddress(rest.address, urlParams?.id);
          if (error) {
            return error;
          }
        }
        contact && Object.assign(contact, rest);
        return contact;
      }
    },
    remove: {
      loader: ({ urlParams }) => {
        state.contacts = state.contacts.filter(item => String(item.id) !== String(urlParams?.id));
        return {};
      }
    }
  }
};

export { mailGatewayData };

export default mailGatewayMock;
