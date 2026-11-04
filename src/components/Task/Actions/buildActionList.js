import CancelTask from './CancelTask';
import RetryTask from './RetryTask';
import ErrorDetail from './ErrorDetail';
import ResultDetail from './ResultDetail';
import InputDetail from './InputDetail';
import ViewLogs from './ViewLogs';

/**
 * 生成任务操作列的动作数组（纯函数，不做渲染）
 * table-view 的 options 渲染器只接受动作数组 / { list }，
 * 列配置必须返回数组，不能再塞 { children: <Actions/> }（会被直接丢弃导致整列空白）
 */
const buildActionList = ({ formatMessage, data, getManualTaskAction, onSuccess, ...props }) => {
  const list = [];
  const actionProps = { ...props, data, onSuccess };

  if (data.runnerType === 'manual' && data.status === 'pending') {
    if (typeof getManualTaskAction === 'function') {
      const buttonComponent = getManualTaskAction(data);
      buttonComponent &&
        list.push({
          ...actionProps,
          buttonComponent,
          children: formatMessage({ id: 'Complete' })
        });
    }
  }

  if (['pending'].indexOf(data.status) > -1) {
    list.push({
      ...actionProps,
      buttonComponent: InputDetail,
      children: formatMessage({ id: 'ViewInputParams' })
    });
  }

  if (['pending', 'running'].indexOf(data.status) > -1) {
    list.push({
      ...actionProps,
      buttonComponent: CancelTask,
      children: formatMessage({ id: 'Cancel' })
    });
  }

  if (['canceled', 'failed'].indexOf(data.status) > -1) {
    list.push({
      ...actionProps,
      buttonComponent: RetryTask,
      children: formatMessage({ id: 'Retry' })
    });
  }

  if (['failed'].indexOf(data.status) > -1) {
    list.push({
      ...actionProps,
      buttonComponent: ErrorDetail,
      children: formatMessage({ id: 'ErrorDetail' })
    });
  }

  if (['success'].indexOf(data.status) > -1) {
    list.push({
      ...actionProps,
      buttonComponent: ResultDetail,
      children: formatMessage({ id: 'ViewResult' })
    });
  }

  if (Array.isArray(data?.options?.logs) && data.options.logs.length > 0) {
    list.push({
      ...actionProps,
      buttonComponent: ViewLogs,
      children: formatMessage({ id: 'ViewLogs' })
    });
  }

  return list;
};

export default buildActionList;
