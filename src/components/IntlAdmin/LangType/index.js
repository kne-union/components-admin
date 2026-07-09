import { createWithRemoteLoader } from '@kne/remote-loader';
import BizUnit from '@components/BizUnit';
import getColumns from './getColumns';
import FormInner from './FormInner';

const LangType = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, menu, pageProps = {} }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  return (
    <BizUnit
      isNext
      name="langType"
      apis={apis.intlAdmin.langType}
      getColumns={getColumns}
      getFormInner={props => <FormInner {...props} />}
      page={{ menu, ...pageProps }}
      options={{
        bizName: '语言种类'
      }}
    />
  );
});

export default LangType;
