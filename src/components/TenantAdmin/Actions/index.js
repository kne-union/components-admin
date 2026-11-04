import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import buildActionList from './buildActionList';

const ActionsInner = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, moreType, children, itemClassName, showLength, ...props }) => {
  const [ButtonGroup] = remoteModules;
  const { formatMessage } = useIntl();

  const actionList = buildActionList({ formatMessage, ...props });

  if (typeof children === 'function') {
    return children({
      itemClassName,
      moreType,
      showLength,
      list: actionList
    });
  }

  return <ButtonGroup itemClassName={itemClassName} list={actionList} moreType={moreType} showLength={showLength} />;
});

export default withLocale(ActionsInner);
export { buildActionList };
