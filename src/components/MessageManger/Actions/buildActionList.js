import Detail from './Detail';
import SendMessage from './SendMessage';
import Resend from './Resend';
import Preview from './Preview';

/**
 * 生成消息管理操作列的动作数组（纯函数，不做渲染）
 * table-view 的 options 渲染器只接受动作数组 / { list }，列配置必须返回数组
 */
const buildActionList = ({ formatMessage, data, detailType, onSuccess, ...props }) => {
  const actionProps = { ...props, data, detailType };
  const list = [];

  list.push({
    ...actionProps,
    buttonComponent: Detail,
    children: formatMessage({ id: 'Detail' }),
    onSuccess
  });

  if (detailType !== 'record') {
    list.push({
      ...actionProps,
      buttonComponent: Preview,
      children: formatMessage({ id: 'Preview' })
    });
  }

  if (detailType !== 'record' && Number(data.status) === 0) {
    list.push({
      ...actionProps,
      buttonComponent: SendMessage,
      children: formatMessage({ id: 'SendMessage' }),
      onSuccess
    });
  }

  if (detailType === 'record') {
    list.push({
      ...actionProps,
      buttonComponent: Resend,
      children: formatMessage({ id: 'Resend' }),
      onSuccess
    });
  }

  return list;
};

export default buildActionList;
