import { createWithRemoteLoader } from '@kne/remote-loader';
import CancelTask from './CancelTask';
import RetryTask from './RetryTask';
import ErrorDetail from './ErrorDetail';
import ResultDetail from './ResultDetail';

const Actions = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, children, data, buttonProps, getManualTaskAction, more, onSuccess }) => {
  const [ButtonGroup] = remoteModules;
  const list = [];

  if (data.runnerType === 'manual' && data.status === 'pending') {
    if (typeof getManualTaskAction === 'function') {
      const buttonComponent = getManualTaskAction(data);
      buttonComponent &&
        list.push({
          ...buttonProps,
          data,
          buttonComponent,
          children: '完成',
          onSuccess
        });
    }
  }

  if (['pending', 'running'].indexOf(data.status) > -1) {
    list.push({
      ...buttonProps,
      buttonComponent: CancelTask,
      data,
      children: '取消',
      onSuccess
    });
  }

  if (['failed'].indexOf(data.status) > -1) {
    list.push(
      {
        ...buttonProps,
        buttonComponent: RetryTask,
        data,
        children: '重试',
        onSuccess
      },
      {
        ...buttonProps,
        buttonComponent: ErrorDetail,
        data,
        children: '错误详情',
        onSuccess
      }
    );
  }

  if (['success'].indexOf(data.status) > -1) {
    list.push({
      ...buttonProps,
      buttonComponent: ResultDetail,
      data,
      children: '查看结果',
      onSuccess
    });
  }

  if (typeof children === 'function') {
    return children({ list });
  }

  return <ButtonGroup list={list} more={more} />;
});

export default Actions;
