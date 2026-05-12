import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import DetailContent from '../DetailContent';

const DetailInner = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal']
})(({ remoteModules, data, detailType, ...props }) => {
  const [useModal] = remoteModules;
  const { formatMessage } = useIntl();
  const modal = useModal();

  return (
    <Button
      {...props}
      onClick={() => {
        modal({
          title: formatMessage({ id: detailType === 'record' ? 'RecordDetail' : 'TemplateDetail' }),
          width: 760,
          footer: null,
          children: <DetailContent data={data} type={detailType} />
        });
      }}
    />
  );
});

const Detail = withLocale(DetailInner);
export default Detail;
