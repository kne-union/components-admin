import DeadLetterReplay from './DeadLetterReplay';
import MessageDetail from './MessageDetail';

/**
 * 生成死信操作列的动作数组（纯函数，不做渲染）
 * table-view 的 options 渲染器只接受动作数组 / { list }，列配置必须返回数组
 */
const buildDeadLetterActionList = ({ formatMessage, data, onSuccess, ...props }) => {
  const list = [];

  if (data && !data.replayed) {
    list.push({
      ...props,
      buttonComponent: DeadLetterReplay,
      data,
      children: formatMessage({ id: 'Replay' }),
      onSuccess
    });
  }

  if (data) {
    list.push({
      ...props,
      buttonComponent: MessageDetail,
      data,
      title: formatMessage({ id: 'DeadLetterList' }),
      children: formatMessage({ id: 'ViewDetail' })
    });
  }

  return list;
};

export default buildDeadLetterActionList;
