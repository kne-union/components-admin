import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import JsonView from '@kne/json-view';
import '@kne/json-view/dist/index.css';

const ErrorDetail = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal', 'components-core:InfoPage']
})(withLocale(({ remoteModules, data, ...props }) => {
  const [useModal, InfoPage] = remoteModules;
  const { formatMessage } = useIntl();
  const modal = useModal();

  return (
    <Button
      {...props}
      onClick={() => {
        modal({
          title: formatMessage({ id: 'ErrorDetailTitle' }),
          footer: null,
          children: (
            <InfoPage>
              <InfoPage.Part title={formatMessage({ id: 'InputParams' })}>
                <JsonView data={data.input} collapsedFrom={1} />
              </InfoPage.Part>
              <InfoPage.Part title={formatMessage({ id: 'ErrorInfo' })}>
                <JsonView data={data.error} collapsedFrom={1} />
              </InfoPage.Part>
            </InfoPage>
          )
        });
      }}
    />
  );
}));

export default ErrorDetail;
