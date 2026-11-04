import MessageDetail from './MessageDetail';

/**
 * 生成消息队列操作列的动作数组（纯函数，不做渲染）
 * table-view 的 options 渲染器只接受动作数组 / { list }，列配置必须返回数组
 */
const buildActionList = ({ formatMessage, data, onSuccess, onTrace, ...props }) => {
  const list = [];

  if (data) {
    list.push({
      ...props,
      buttonComponent: MessageDetail,
      data,
      children: formatMessage({ id: 'ViewDetail' }),
      onSuccess
    });
  }

  if (data?.traceId && typeof onTrace === 'function') {
    list.push({
      ...props,
      children: formatMessage({ id: 'ViewTrace' }),
      onClick: () => onTrace(data)
    });
  }

  return list;
};

export default buildActionList;
