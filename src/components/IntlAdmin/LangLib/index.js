import { createWithRemoteLoader } from '@kne/remote-loader';
import BizUnit from '@components/BizUnit';
import getColumns from './getColumns';

const LangLib = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Layout@TablePage']
})(({ remoteModules, menu }) => {
  const [usePreset, TablePage] = remoteModules;
  const { apis } = usePreset();
  return (
    <BizUnit name="langLib" apis={apis.intlAdmin.langLib} getColumns={getColumns}>
      {({ filter, topOptions, titleExtra, tableOptions }) => {
        return (
          <TablePage
            {...tableOptions}
            page={{
              menu,
              filter,
              titleExtra,
              topOptions
            }}
          />
        );
      }}
    </BizUnit>
  );
});

export default LangLib;
