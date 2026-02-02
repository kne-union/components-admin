import { createWithRemoteLoader } from '@kne/remote-loader';

const TablePageRender = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage']
})(({ remoteModules, filter, titleExtra, tableOptions }) => {
  const [TablePage] = remoteModules;
  return (
    <TablePage
      {...tableOptions}
      page={{
        filter,
        titleExtra
      }}
    />
  );
});

export default TablePageRender;
