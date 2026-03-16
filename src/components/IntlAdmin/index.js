import AppChildrenRouter from '@kne/app-children-router';
import { createWithRemoteLoader } from '@kne/remote-loader';
import LangType from './LangType';
import LangLib from './LangLib';
import enums from './enums';

const IntlAdmin = createWithRemoteLoader({
  modules: ['components-core:Menu']
})(({ remoteModules, baseUrl, pageProps, ...props }) => {
  const [Menu] = remoteModules;

  const menu = (
    <Menu
      items={[
        {
          path: `${baseUrl}`,
          label: '语言类型'
        },
        {
          path: `${baseUrl}/lang-lib`,
          label: '语言库'
        }
      ]}
    />
  );

  return (
    <AppChildrenRouter
      {...props}
      baseUrl={baseUrl}
      list={[
        {
          index: true,
          loader: () => import('./LangType'),
          elementProps: {
            menu,
            pageProps
          }
        },
        {
          path: 'lang-lib',
          loader: () => import('./LangLib'),
          elementProps: {
            menu,
            pageProps
          }
        }
      ]}
    />
  );
});

IntlAdmin.LangType = LangType;
IntlAdmin.LangLib = LangLib;

export default IntlAdmin;
export { LangType, LangLib, enums };
