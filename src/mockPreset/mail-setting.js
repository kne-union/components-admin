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

const systemTemplates = () => messageMangerData.templates.pageData.filter(item => Number(item.type) === 0 && Number(item.status) === 0);
const findSystemTemplate = code => systemTemplates().find(item => item.code === code);

const getInput = ({ params, data } = {}) => Object.assign({}, params, data);

const toSmtpDetail = smtp =>
  smtp
    ? Object.assign({ configured: true, hasPassword: !!smtp.pass }, smtp, { pass: undefined })
    : { configured: false, enabled: false, port: 465, secure: true, hasPassword: false };

const renderPreview = (template, props) => {
  const values = props || buildExampleProps(getTemplateVariables(template));
  return {
    props: values,
    subject: renderTemplate(template.subject || '', values, { type: 'text' }),
    html: renderTemplate(template.content || '', values, { type: 'html' })
  };
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
      const store = getStore(getInput(options).tenantId);
      return {
        list: systemTemplates().map(tpl => {
          const own = store.templates[tpl.code];
          return {
            code: tpl.code,
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
      const { tenantId, code } = getInput(options);
      const own = getStore(tenantId).templates[code];
      return { customized: !!own, template: own || findSystemTemplate(code) };
    }
  },
  templateCustomize: {
    loader: options => {
      const { tenantId, code } = getInput(options);
      const store = getStore(tenantId);
      if (!store.templates[code]) {
        store.templates[code] = Object.assign({}, findSystemTemplate(code), {
          id: `tenant_${code}`,
          tenantId: tenantId || 'current',
          level: 1,
          status: 0,
          updatedAt: new Date().toISOString()
        });
      }
      return store.templates[code];
    }
  },
  templateSave: {
    loader: options => {
      const { tenantId, code, ...input } = getInput(options);
      const own = getStore(tenantId).templates[code];
      return Object.assign(own, input, { updatedAt: new Date().toISOString() });
    }
  },
  templateSetStatus: {
    loader: options => {
      const { tenantId, code, status } = getInput(options);
      const own = getStore(tenantId).templates[code];
      return Object.assign(own, { status: Number(status), updatedAt: new Date().toISOString() });
    }
  },
  templateReset: {
    loader: options => {
      const { tenantId, code } = getInput(options);
      delete getStore(tenantId).templates[code];
      return {};
    }
  },
  templatePreview: {
    loader: options => {
      const { tenantId, code, template, props } = getInput(options);
      const current = getStore(tenantId).templates[code] || findSystemTemplate(code);
      return renderPreview(template ? Object.assign({ variables: current.variables }, template) : current, props);
    }
  }
});

export default createMailSettingMock;
