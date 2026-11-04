import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import buildActionList from './buildActionList';

const Actions = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(
  withLocale(({ remoteModules, moreType, children, itemClassName, className, place, showLength, ...props }) => {
    const { formatMessage } = useIntl();
    const [ButtonGroup] = remoteModules;
    // className 须同时落到每个按钮上：styles 选择器是 .options-column .options-btn.ant-btn，
    // 只挂 ButtonGroup 容器无效。ButtonGroup 仍保留 className（卡片 place/布局用）。
    const actionList = buildActionList({ ...props, ...(className ? { className } : {}), formatMessage });

    if (typeof children === 'function') {
      return children({
        className,
        itemClassName,
        moreType,
        place,
        showLength,
        list: actionList
      });
    }

    return (
      <ButtonGroup className={className} place={place} itemClassName={itemClassName} list={actionList} moreType={moreType} showLength={showLength} />
    );
  })
);

export default Actions;
