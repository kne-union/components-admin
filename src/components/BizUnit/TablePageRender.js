import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';

const TablePageRender = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:TablePage']
})(({ remoteModules, titleExtra, tableOptions, page }) => {
  const [LayoutTablePage, NextTablePage] = remoteModules;

  if (tableOptions?.isNext) {
    const { page: layoutPage, isNext, ...nextTableOptions } = tableOptions;
    return <NextTablePage {...nextTableOptions} />;
  }

  return (
    <LayoutTablePage
      {...tableOptions}
      page={merge({}, tableOptions.page, page, titleExtra ? { titleExtra } : {})}
    />
  );
});

export default TablePageRender;
