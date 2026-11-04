import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import buildDeadLetterActionList from './buildDeadLetterActionList';

const DeadLetterActionsInner = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, children, data, onSuccess, moreType = 'link', itemClassName, ...props }) => {
  const [ButtonGroup] = remoteModules;
  const { formatMessage } = useIntl();

  const list = buildDeadLetterActionList({ formatMessage, data, onSuccess, ...props });

  if (typeof children === 'function') {
    return children({ list });
  }

  return <ButtonGroup itemClassName={itemClassName} list={list} moreType={moreType} />;
});

const DeadLetterActions = withLocale(DeadLetterActionsInner);
export default DeadLetterActions;
export { buildDeadLetterActionList };
