import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button } from 'antd';
import style from '../style.module.scss';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import JsonView from '@kne/json-view';
import '@kne/json-view/dist/index.css';

const ViewLogs = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal', 'components-core:InfoPage@Flow']
})(
  withLocale(({ remoteModules, data, ...props }) => {
    const [useModal, Flow] = remoteModules;
    const { formatMessage } = useIntl();
    const modal = useModal();
    const logs = data?.options?.logs || [];

    const columns = [
      {
        name: 'message',
        title: formatMessage({ id: 'Message' }),
        type: 'title'
      },
      {
        name: 'title',
        title: formatMessage({ id: 'LogItem' }),
        type: 'subTitle',
        format: 'datetime'
      },
      {
        name: 'data',
        type: 'content',
        render: data => {
          if (!data) return null;
          return <JsonView data={data} collapsedFrom={1} />;
        }
      }
    ];

    const dataSource = logs.map((log, index) => ({
      title: log.time,
      message: log.message,
      data: log.data
    }));

    return (
      <Button
        {...props}
        onClick={() => {
          modal({
            title: formatMessage({ id: 'ViewLogsTitle' }),
            footer: null,
            children: <Flow dataSource={dataSource} columns={columns} direction="vertical" size="small" current={dataSource.length - 1} progressDot />
          });
        }}
      />
    );
  })
);

export default ViewLogs;
