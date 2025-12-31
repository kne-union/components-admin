const TASK_STATUS_ENUM = () => [
  { value: 'pending', description: '等待执行', type: 'info' },
  {
    value: 'running',
    description: '执行中',
    type: 'progress'
  },
  { value: 'waiting', description: '等待操作', type: 'info' },
  {
    value: 'success',
    description: '成功',
    type: 'success'
  },
  { value: 'failed', description: '失败', type: 'danger' },
  { value: 'canceled', description: '取消' }
];

const enums = { taskStatus: TASK_STATUS_ENUM };

export default enums;
