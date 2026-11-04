import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';
import buildActionList from './buildActionList';

const Actions = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(
  withLocale(({ remoteModules, moreType, children, itemClassName, showLength, place, className, ...props }) => {
    const [ButtonGroup] = remoteModules;
    const { formatMessage } = useIntl();

    const actionList = buildActionList({ formatMessage, className, ...props });

    if (typeof children === 'function') {
      return children({
        ...props,
        className,
        place,
        itemClassName,
        moreType,
        showLength,
        list: actionList
      });
    }

    return (
      <ButtonGroup
        className={className}
        place={place}
        itemClassName={itemClassName}
        list={actionList}
        moreType={moreType}
        showLength={showLength}
      />
    );
  })
);

export default Actions;
export { buildActionList };
