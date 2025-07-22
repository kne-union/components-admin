import { createWithRemoteLoader } from '@kne/remote-loader';
import getColumns from './getColumns';

const Record = createWithRemoteLoader({
  modules: ['components-core:Table@TablePage', 'components-core:Global@usePreset']
})(({ remoteModules, id }) => {
  const [TablePage, usePreset] = remoteModules;
  const { apis } = usePreset();
  return (
    <TablePage
      {...Object.assign({}, apis.webhook.invokeRecord, {
        params: { id }
      })}
      columns={[...getColumns()]}
    />
  );
});

export default Record;
