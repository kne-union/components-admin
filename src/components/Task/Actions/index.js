import { createWithRemoteLoader } from '@kne/remote-loader';
import CancelTask from './CancelTask';
import RetryTask from './RetryTask';
import ErrorDetail from './ErrorDetail';
import ResultDetail from './ResultDetail';

const Actions = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, children, data, getManualTaskAction, onSuccess, moreType = 'link', itemClassName, ...props }) => {
  const [ButtonGroup] = remoteModules;
  const list = [];

  if (data.runnerType === 'manual' && data.status === 'pending') {
    if (typeof getManualTaskAction === 'function') {
      const buttonComponent = getManualTaskAction(data);
      buttonComponent &&
        list.push({
          ...props,
          data,
          buttonComponent,
          children: '完成',
          onSuccess
        });
    }
  }

  if (['pending', 'running'].indexOf(data.status) > -1) {
    list.push({
      ...props,
      buttonComponent: CancelTask,
      data,
      children: '取消',
      onSuccess
    });
  }

  if (['canceled', 'failed'].indexOf(data.status) > -1) {
    list.push({
      ...props,
      buttonComponent: RetryTask,
      data,
      children: '重试',
      onSuccess
    });
  }

  if (['failed'].indexOf(data.status) > -1) {
    list.push({
      ...props,
      buttonComponent: ErrorDetail,
      data,
      children: '错误详情',
      onSuccess
    });
  }

  if (['success'].indexOf(data.status) > -1) {
    list.push({
      ...props,
      buttonComponent: ResultDetail,
      data,
      children: '查看结果',
      onSuccess
    });
  }

  if (typeof children === 'function') {
    return children({ list });
  }

  return <ButtonGroup itemClassName={itemClassName} list={list} moreType={moreType} />;
});

export default Actions;
