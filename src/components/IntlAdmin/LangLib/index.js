import { createWithRemoteLoader } from '@kne/remote-loader';
import BizUnit from '@components/BizUnit';
import getColumns from './getColumns';

const LangLib = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, menu, pageProps = {} }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  return (
    <BizUnit
      isNext
      name="langLib"
      apis={apis.intlAdmin.langLib}
      getColumns={getColumns}
      page={{ menu, ...pageProps }}
    />
  );
});

export default LangLib;
