import AppChildrenRouter from '@kne/app-children-router';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import LangType from './LangType';
import LangLib from './LangLib';
import enums from './enums';
import withLocale from './withLocale';
import { INTL_NAMESPACE_TYPE } from './constants';

const IntlAdmin = createWithRemoteLoader({
  modules: ['components-core:Menu']
})(
  withLocale(({ remoteModules, baseUrl, pageProps, ...props }) => {
    const [Menu] = remoteModules;
    const { formatMessage } = useIntl();

    const menu = (
      <Menu
        items={[
          {
            path: `${baseUrl}`,
            label: formatMessage({ id: 'LangType' })
          },
          {
            path: `${baseUrl}/lang-lib`,
            label: formatMessage({ id: 'LangLib' })
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
  })
);

IntlAdmin.LangType = LangType;
IntlAdmin.LangLib = LangLib;

export default IntlAdmin;
export { LangType, LangLib, enums, INTL_NAMESPACE_TYPE };
