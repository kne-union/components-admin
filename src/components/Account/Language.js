import { createWithRemoteLoader } from '@kne/remote-loader';
import LanguageField from '@components/Language';
import localStorage from '@kne/local-storage';
import useRefCallback from '@kne/use-ref-callback';
import { useEffect } from 'react';

const Language = createWithRemoteLoader({
  modules: ['components-core:Global@useGlobalValue', 'components-core:Global@useGlobalContext']
})(({ remoteModules, ...props }) => {
  const [useGlobalValue, useGlobalContext] = remoteModules;
  const locale = useGlobalValue('locale');
  const { setGlobal } = useGlobalContext('locale');
  const initLocale = useRefCallback(() => {
    const targetLocale = localStorage.getItem('X-User-Locale');
    if (['en-US', 'zh-CN'].indexOf(targetLocale) > -1 && targetLocale !== locale) {
      setGlobal(targetLocale);
    }
  });
  useEffect(() => {
    initLocale();
  }, [initLocale]);
  return (
    <LanguageField
      {...props}
      locale={locale}
      onChange={locale => {
        setGlobal(locale);
        localStorage.setItem('X-User-Locale', locale);
      }}
    />
  );
});

export default Language;
