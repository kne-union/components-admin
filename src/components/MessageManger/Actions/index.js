import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import Detail, { openDetail } from './Detail';
import SendMessage from './SendMessage';
import Resend from './Resend';
import Preview, { openTemplatePreview } from './Preview';
import Copy from './Copy';
import TenantOpen from './TenantOpen';
import buildActionList from './buildActionList';

const ActionsInner = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, children, data, detailType, onSuccess, moreType = 'link', itemClassName, ...props }) => {
  const [ButtonGroup] = remoteModules;
  const { formatMessage } = useIntl();

  const list = buildActionList({ formatMessage, data, detailType, onSuccess, ...props });

  if (typeof children === 'function') {
    return children({ list });
  }

  return <ButtonGroup itemClassName={itemClassName} list={list} moreType={moreType} />;
});

const Actions = withLocale(ActionsInner);

export { Detail, SendMessage, Resend, Preview, Copy, TenantOpen, openTemplatePreview, openDetail, buildActionList };
export default Actions;
