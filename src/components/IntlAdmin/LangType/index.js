import { createWithRemoteLoader } from '@kne/remote-loader';
import BizUnit from '@components/BizUnit';
import getColumns from './getColumns';
import FormInner from './FormInner';

const LangType = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Layout@TablePage']
})(({ remoteModules, menu, pageProps = {} }) => {
  const [usePreset, TablePage] = remoteModules;
  const { apis } = usePreset();
  return (
    <BizUnit
      name="langType"
      apis={apis.intlAdmin.langType}
      getColumns={getColumns}
      getFormInner={props => <FormInner {...props} />}
      options={{
        bizName: '语言种类'
      }}>
      {({ filter, topOptions, titleExtra, tableOptions }) => {
        return (
          <TablePage
            {...Object.assign({}, tableOptions)}
            page={{
              ...pageProps,
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

export default LangType;
