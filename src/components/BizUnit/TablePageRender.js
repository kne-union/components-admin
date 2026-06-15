import { createWithRemoteLoader } from '@kne/remote-loader';

const TablePageRender = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage']
})(({ remoteModules, filter, titleExtra, tableOptions }) => {
  const [TablePage] = remoteModules;
  return (
    <TablePage
      {...tableOptions}
      page={Object.assign(
        {},
        {
          filter,
          titleExtra
        },
        tableOptions.page
      )}
    />
  );
});

export default TablePageRender;
