import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import DetailContent from '../DetailContent';
import Resend from './Resend';

export const openDetail = ({ modal, formatMessage, data, detailType, onSuccess }) =>
  modal({
    title: formatMessage({ id: detailType === 'record' ? 'RecordDetail' : 'TemplateDetail' }),
    width: 960,
    footer: null,
    children: (
      <DetailContent
        data={data}
        type={detailType}
        extra={
          detailType === 'record' ? (
            <Resend size="small" data={data} detailType={detailType} onSuccess={onSuccess}>
              {formatMessage({ id: 'Resend' })}
            </Resend>
          ) : null
        }
      />
    )
  });

const DetailInner = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal']
})(({ remoteModules, data, detailType, onSuccess, ...props }) => {
  const [useModal] = remoteModules;
  const { formatMessage } = useIntl();
  const modal = useModal();

  return <Button {...props} onClick={() => openDetail({ modal, formatMessage, data, detailType, onSuccess })} />;
});

const Detail = withLocale(DetailInner);
export default Detail;
