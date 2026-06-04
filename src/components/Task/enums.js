import { createFormatMessage } from './withLocale';

const taskStatus = ({ locale }) => {
  const formatMessage = createFormatMessage(locale);
  return [
    { description: formatMessage({ id: 'Pending' }), value: 'pending', type: 'info' },
    { description: formatMessage({ id: 'Running' }), value: 'running', type: 'progress' },
    { description: formatMessage({ id: 'Waiting' }), value: 'waiting', type: 'info' },
    { description: formatMessage({ id: 'Success' }), value: 'success', type: 'success' },
    { description: formatMessage({ id: 'Failed' }), value: 'failed', type: 'danger' },
    { description: formatMessage({ id: 'Canceled' }), value: 'canceled' }
  ];
};

const enums = { taskStatus };

export default enums;
