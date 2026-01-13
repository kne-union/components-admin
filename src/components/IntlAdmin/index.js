import AppChildrenRouter from '@kne/app-children-router';
import { createWithRemoteLoader } from '@kne/remote-loader';

const IntlAdmin = createWithRemoteLoader({
  modules: ['components-core:Menu']
})(({ remoteModules, baseUrl, ...props }) => {
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

  console.log(baseUrl);

  return (
    <AppChildrenRouter
      {...props}
      baseUrl={baseUrl}
      list={[
        {
          index: true,
          loader: () => import('./LangType'),
          elementProps: {
            menu
          }
        },
        {
          path: 'lang-lib',
          loader: () => import('./LangLib'),
          elementProps: {
            menu
          }
        }
      ]}
    />
  );
});

export default IntlAdmin;
