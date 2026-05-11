import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import MessageDetail from './MessageDetail';

const ActionsInner = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, children, data, onSuccess, onTrace, moreType = 'link', itemClassName, ...props }) => {
  const [ButtonGroup] = remoteModules;
  const { formatMessage } = useIntl();
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

  if (typeof children === 'function') {
    return children({ list });
  }

  return <ButtonGroup itemClassName={itemClassName} list={list} moreType={moreType} />;
});

const Actions = withLocale(ActionsInner);
export default Actions;
