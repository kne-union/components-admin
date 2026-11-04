import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import buildActionList from './buildActionList';

const ActionsInner = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, children, data, onSuccess, onTrace, moreType = 'link', itemClassName, ...props }) => {
  const [ButtonGroup] = remoteModules;
  const { formatMessage } = useIntl();

  const list = buildActionList({ formatMessage, data, onSuccess, onTrace, ...props });

  if (typeof children === 'function') {
    return children({ list });
  }

  return <ButtonGroup itemClassName={itemClassName} list={list} moreType={moreType} />;
});

const Actions = withLocale(ActionsInner);
export default Actions;
export { buildActionList };
