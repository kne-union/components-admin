import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button } from 'antd';
import style from '../style.module.scss';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

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
                <div className={style['error-box']}>
                  <pre>{JSON.stringify(data.input, null, 2)}</pre>
                </div>
              </InfoPage.Part>
              <InfoPage.Part title={formatMessage({ id: 'ErrorInfo' })}>
                <div className={style['error-box']}>
                  <pre>{JSON.stringify(data.error, null, 2)}</pre>
                </div>
              </InfoPage.Part>
            </InfoPage>
          )
        });
      }}
    />
  );
}));

export default ErrorDetail;
