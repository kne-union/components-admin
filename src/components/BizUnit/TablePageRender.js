import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';

const TablePageRender = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Table@TablePage', 'components-core:TablePage']
})(({ remoteModules, titleExtra, tableOptions, page, withPage = true }) => {
  const [LayoutTablePage, LegacyTablePage, NextTablePage] = remoteModules;

  if (tableOptions?.isNext) {
    const { page: layoutPage, isNext, ...nextTableOptions } = tableOptions;
    // SystemLayout / 外层已包 Page 时不要再套 Layout@TablePage，否则会调用不存在的 setPageProps
    if (!withPage) {
      return <NextTablePage {...nextTableOptions} />;
    }
    return (
      <LayoutTablePage
        {...nextTableOptions}
        isNext
        page={merge({}, layoutPage, page, titleExtra ? { titleExtra } : {})}
      />
    );
  }

  // SystemLayout / 外层已包 Page 时不要再套 Layout@TablePage，否则会调用不存在的 setPageProps
  if (!withPage) {
    return <LegacyTablePage {...tableOptions} />;
  }

  return (
    <LayoutTablePage
      {...tableOptions}
      page={merge({}, tableOptions.page, page, titleExtra ? { titleExtra } : {})}
    />
  );
});

export default TablePageRender;
