import { useEffect, useRef } from 'react';
import { HashRouter } from 'react-router-dom';
import createEntry from '@kne/modules-dev/dist/create-entry.modern';
import '@kne/modules-dev/dist/create-entry.css';
import { createWithRemoteLoader } from '@kne/remote-loader';
import Language from '@components/Account/Language';
import readme from 'readme';

const ExampleRoutes = createEntry.ExampleRoutes;

/** 文档站语言切换：写入 locale 后刷新，使示例内 PureGlobal 重读 mockPreset.locale */
const DocsLanguage = createWithRemoteLoader({
  modules: ['components-core:Global@useGlobalValue']
})(({ remoteModules }) => {
  const [useGlobalValue] = remoteModules;
  const locale = useGlobalValue('locale');
  const prevLocaleRef = useRef(locale);

  useEffect(() => {
    if (prevLocaleRef.current && locale && prevLocaleRef.current !== locale) {
      window.location.reload();
      return;
    }
    prevLocaleRef.current = locale;
  }, [locale]);

  return <Language />;
});

const App = ({ globalPreset, ...props }) => {
  return (
    <HashRouter>
      <ExampleRoutes
        {...props}
        paths={[
          {
            key: 'components',
            path: '/',
            title: '首页'
          }
        ]}
        preset={globalPreset}
        themeToken={globalPreset.themeToken}
        readme={readme}
        navigation={{
          rightOptions: <DocsLanguage />
        }}
      />
    </HashRouter>
  );
};

export default App;
