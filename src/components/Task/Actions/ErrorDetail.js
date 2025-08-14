import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button } from 'antd';
import style from '../style.module.scss';

const ErrorDetail = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal', 'components-core:InfoPage']
})(({ remoteModules, data, ...props }) => {
  const [useModal, InfoPage] = remoteModules;
  const modal = useModal();

  return (
    <Button
      {...props}
      onClick={() => {
        modal({
          title: '错误详情',
          footer: null,
          children: (
            <InfoPage>
              <InfoPage.Part title="输入参数">
                <div className={style['error-box']}>
                  <pre>{JSON.stringify(data.input, null, 2)}</pre>
                </div>
              </InfoPage.Part>
              <InfoPage.Part title="错误信息">
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
});

export default ErrorDetail;
