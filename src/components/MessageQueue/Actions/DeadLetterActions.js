import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import DeadLetterReplay from './DeadLetterReplay';
import MessageDetail from './MessageDetail';

const DeadLetterActionsInner = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, children, data, onSuccess, moreType = 'link', itemClassName, ...props }) => {
  const [ButtonGroup] = remoteModules;
  const { formatMessage } = useIntl();
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

  if (typeof children === 'function') {
    return children({ list });
  }

  return <ButtonGroup itemClassName={itemClassName} list={list} moreType={moreType} />;
});

const DeadLetterActions = withLocale(DeadLetterActionsInner);
export default DeadLetterActions;
