const MESSAGE_STATUS_ENUM = [
  { value: 'PENDING', description: '等待执行', type: 'info' },
  { value: 'PROCESSING', description: '处理中', type: 'progress' },
  { value: 'COMPLETED', description: '已完成', type: 'success' },
  { value: 'FAILED', description: '失败', type: 'danger' }
];

const TRACE_EVENT_ENUM = [
  { value: 'PUBLISHED', description: '消息发布', type: 'info' },
  { value: 'PROCESSING', description: '开始处理', type: 'progress' },
  { value: 'COMPLETED', description: '处理完成', type: 'success' },
  { value: 'FAILED', description: '处理失败', type: 'danger' },
  { value: 'MOVED_TO_DLQ', description: '进入死信', type: 'danger' },
  { value: 'REPLAYED', description: '死信重放', type: 'success' },
  { value: 'LOCK_RECOVERED', description: '锁定恢复', type: 'info' }
];

const YES_NO_ENUM = [
  { value: true, description: '是', type: 'success' },
  { value: false, description: '否', type: 'info' }
];

const enums = {
  messageStatus: MESSAGE_STATUS_ENUM,
  traceEvent: TRACE_EVENT_ENUM,
  mqBoolean: YES_NO_ENUM
};

export default enums;
