import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import Detail from './Detail';
import SendMessage from './SendMessage';
import Resend from './Resend';

const ActionsInner = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, children, data, detailType, onSuccess, moreType = 'link', itemClassName, ...props }) => {
  const [ButtonGroup] = remoteModules;
  const { formatMessage } = useIntl();
  const list = [];

  list.push({
    ...props,
    buttonComponent: Detail,
    data,
    detailType,
    children: formatMessage({ id: 'Detail' }),
    onSuccess
  });

  if (detailType !== 'record' && Number(data.status) === 0) {
    list.push({
      ...props,
      buttonComponent: SendMessage,
      data,
      detailType,
      children: formatMessage({ id: 'SendMessage' }),
      onSuccess
    });
  }

  if (detailType === 'record') {
    list.push({
      ...props,
      buttonComponent: Resend,
      data,
      detailType,
      children: formatMessage({ id: 'Resend' }),
      onSuccess
    });
  }

  if (typeof children === 'function') {
    return children({ list });
  }

  return <ButtonGroup itemClassName={itemClassName} list={list} moreType={moreType} />;
});

const Actions = withLocale(ActionsInner);

export { Detail, SendMessage, Resend };
export default Actions;
