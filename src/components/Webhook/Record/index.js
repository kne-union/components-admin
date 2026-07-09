import { createWithRemoteLoader } from '@kne/remote-loader';
import getColumns from './getColumns';

const Record = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Global@usePreset']
})(({ remoteModules, id, type }) => {
  const [TablePage, usePreset] = remoteModules;
  const { apis } = usePreset();
  return (
    <TablePage
      isNext
      {...Object.assign({}, apis.webhook.invokeRecord, {
        params: { id, type }
      })}
      columns={[...getColumns()]}
    />
  );
});

export default Record;
