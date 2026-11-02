import { renderTemplate } from '@kne/message-template';
import { buildExampleProps, getTemplateVariables } from '@components/MessageManger/utils';
import messageMangerData from './message-manger-data.json';

// 示例内按租户保存 SMTP 与自定义模版，刷新页面后重置
const stores = {};
const getStore = tenantId => {
  const key = tenantId || 'current';
  if (!stores[key]) {
    stores[key] = { smtp: null, templates: {} };
  }
  return stores[key];
};

const TEMPLATE_TYPES = [0, 1];
const toType = type => Number(type || 0);
const templateKey = (code, type) => `${code}:${toType(type)}`;

const systemTemplates = type => messageMangerData.templates.pageData.filter(item => Number(item.type) === type && Number(item.status) === 0);
const findSystemTemplate = (code, type) => systemTemplates(toType(type)).find(item => item.code === code);

const getInput = ({ params, data } = {}) => Object.assign({}, params, data);

const toSmtpDetail = smtp =>
  smtp
    ? Object.assign({ configured: true, hasPassword: !!smtp.pass }, smtp, { pass: undefined })
    : { configured: false, enabled: false, port: 465, secure: true, hasPassword: false };

const renderPreview = (template, props) => {
  const values = props || buildExampleProps(getTemplateVariables(template));
  if (toType(template.type) === 1) {
    return { props: values, text: renderTemplate(template.content || '', values, { type: 'text' }) };
  }
  return {
    props: values,
    subject: renderTemplate(template.subject || '', values, { type: 'text' }),
    html: renderTemplate(template.content || '', values, { type: 'html' })
  };
};

const customize = (tenantId, code, type) => {
  const store = getStore(tenantId);
  const key = templateKey(code, type);
  if (!store.templates[key]) {
    store.templates[key] = Object.assign({}, findSystemTemplate(code, type), {
      id: `tenant_${key}`,
      tenantId: tenantId || 'current',
      level: 1,
      status: 0,
      updatedAt: new Date().toISOString()
    });
  }
  return store.templates[key];
};

const createMailSettingMock = () => ({
  smtpDetail: {
    loader: options => toSmtpDetail(getStore(getInput(options).tenantId).smtp)
  },
  smtpSave: {
    loader: options => {
      const { tenantId, ...input } = getInput(options);
      const store = getStore(tenantId);
      store.smtp = Object.assign({}, store.smtp, input, { pass: input.pass || store.smtp?.pass });
      return toSmtpDetail(store.smtp);
    }
  },
  smtpRemove: {
    loader: options => {
      getStore(getInput(options).tenantId).smtp = null;
      return {};
    }
  },
  smtpTest: {
    loader: () => ({ success: true })
  },
  templateList: {
    loader: options => {
      const { tenantId, type } = getInput(options);
      const store = getStore(tenantId);
      const types = type === undefined || type === '' ? TEMPLATE_TYPES : [toType(type)];
      return {
        list: types.flatMap(systemTemplates).map(tpl => {
          const own = store.templates[templateKey(tpl.code, tpl.type)];
          return {
            code: tpl.code,
            type: Number(tpl.type),
            name: tpl.name,
            description: tpl.description,
            systemTemplateId: tpl.id,
            customized: !!own,
            templateId: own ? own.id : null,
            status: own ? own.status : null,
            updatedAt: own ? own.updatedAt : null
          };
        })
      };
    }
  },
  templateDetail: {
    loader: options => {
      const { tenantId, code, type } = getInput(options);
      const own = getStore(tenantId).templates[templateKey(code, type)];
      return { customized: !!own, template: own || findSystemTemplate(code, type) };
    }
  },
  templateCustomize: {
    loader: options => {
      const { tenantId, code, type } = getInput(options);
      return customize(tenantId, code, type);
    }
  },
  templateSave: {
    loader: options => {
      const { tenantId, code, type, ...input } = getInput(options);
      return Object.assign(customize(tenantId, code, type), input, { updatedAt: new Date().toISOString() });
    }
  },
  templateSetStatus: {
    loader: options => {
      const { tenantId, code, type, status } = getInput(options);
      const own = getStore(tenantId).templates[templateKey(code, type)];
      return Object.assign(own, { status: Number(status), updatedAt: new Date().toISOString() });
    }
  },
  templateReset: {
    loader: options => {
      const { tenantId, code, type } = getInput(options);
      delete getStore(tenantId).templates[templateKey(code, type)];
      return {};
    }
  },
  templatePreview: {
    loader: options => {
      const { tenantId, code, type, template, props } = getInput(options);
      const current = getStore(tenantId).templates[templateKey(code, type)] || findSystemTemplate(code, type);
      return renderPreview(template ? Object.assign({ type: current.type, variables: current.variables }, template) : current, props);
    }
  }
});

export default createMailSettingMock;
