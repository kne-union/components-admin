const MESSAGE_TYPE_ENUM = [
  { value: 0, description: '邮件', label: 'Email', type: 'blue' },
  { value: 1, description: '短信', label: 'SMS', type: 'green' }
];

const MESSAGE_TEMPLATE_LEVEL_ENUM = [
  { value: 0, description: '系统', label: 'System', type: 'blue' },
  { value: 1, description: '业务', label: 'Business', type: 'purple' }
];

const MESSAGE_TEMPLATE_STATUS_ENUM = [
  { value: 0, description: '启用', label: 'Enabled', type: 'green' },
  { value: 1, description: '禁用', label: 'Disabled', type: 'default' }
];

const MESSAGE_TYPE_COLORS = {
  0: 'blue',
  1: 'green'
};

const enums = {
  messageManagerType: MESSAGE_TYPE_ENUM,
  messageTemplateLevel: MESSAGE_TEMPLATE_LEVEL_ENUM,
  messageTemplateStatus: MESSAGE_TEMPLATE_STATUS_ENUM
};

export { MESSAGE_TYPE_COLORS };
export default enums;
