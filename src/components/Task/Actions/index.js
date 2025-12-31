import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import CancelTask from './CancelTask';
import RetryTask from './RetryTask';
import ErrorDetail from './ErrorDetail';
import ResultDetail from './ResultDetail';

const ActionsInner = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, children, data, getManualTaskAction, onSuccess, moreType = 'link', itemClassName, ...props }) => {
  const [ButtonGroup] = remoteModules;
  const { formatMessage } = useIntl();
  const list = [];

  if (data.runnerType === 'manual' && data.status === 'pending') {
    if (typeof getManualTaskAction === 'function') {
      const buttonComponent = getManualTaskAction(data);
      buttonComponent &&
        list.push({
          ...props,
          data,
          buttonComponent,
          children: formatMessage({ id: 'Complete' }),
          onSuccess
        });
    }
  }

  if (['pending', 'running'].indexOf(data.status) > -1) {
    list.push({
      ...props,
      buttonComponent: CancelTask,
      data,
      children: formatMessage({ id: 'Cancel' }),
      onSuccess
    });
  }

  if (['canceled', 'failed'].indexOf(data.status) > -1) {
    list.push({
      ...props,
      buttonComponent: RetryTask,
      data,
      children: formatMessage({ id: 'Retry' }),
      onSuccess
    });
  }

  if (['failed'].indexOf(data.status) > -1) {
    list.push({
      ...props,
      buttonComponent: ErrorDetail,
      data,
      children: formatMessage({ id: 'ErrorDetail' }),
      onSuccess
    });
  }

  if (['success'].indexOf(data.status) > -1) {
    list.push({
      ...props,
      buttonComponent: ResultDetail,
      data,
      children: formatMessage({ id: 'ViewResult' }),
      onSuccess
    });
  }

  if (typeof children === 'function') {
    return children({ list });
  }

  return <ButtonGroup itemClassName={itemClassName} list={list} moreType={moreType} />;
});

const Actions = withLocale(ActionsInner);
export default Actions;
