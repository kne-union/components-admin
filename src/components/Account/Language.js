import { createWithRemoteLoader } from '@kne/remote-loader';
import LanguageField from '@components/Language';
import localStorage from '@kne/local-storage';
import useRefCallback from '@kne/use-ref-callback';
import { useEffect, useMemo } from 'react';

const DEFAULT_LANGUAGE_LIST = [
  { label: '中文', value: 'zh-CN' },
  { label: 'EN', value: 'en-US' }
];

const LANGUAGE_LABEL_MAP = {
  'zh-CN': '中文',
  'zh-TW': '繁體',
  'en-US': 'EN',
  'en-GB': 'EN',
  'ja-JP': '日本語',
  'ko-KR': '한국어',
  'fr-FR': 'Français',
  'de-DE': 'Deutsch',
  'es-ES': 'Español',
  'pt-BR': 'Português'
};

const normalizeSupportLanguage = value => {
  if (Array.isArray(value)) {
    return value.map(item => String(item || '').trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(item => String(item || '').trim()).filter(Boolean);
      }
    } catch (e) {
      // ignore
    }
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
  return [];
};

export const buildLanguageList = supportLanguage => {
  const languages = normalizeSupportLanguage(supportLanguage);
  if (languages.length === 0) {
    return DEFAULT_LANGUAGE_LIST;
  }
  return languages.map(code => ({
    value: code,
    label: LANGUAGE_LABEL_MAP[code] || code
  }));
};

const LanguageInner = ({
  locale,
  setGlobal,
  list: listProp,
  defaultLocale: defaultLocaleProp,
  supportLanguage,
  defaultLanguage = 'zh-CN',
  ...props
}) => {
  const list = useMemo(() => {
    if (listProp) {
      return listProp;
    }
    return buildLanguageList(supportLanguage);
  }, [listProp, supportLanguage]);

  const normalizedSupport = normalizeSupportLanguage(supportLanguage);
  const defaultLocale =
    defaultLocaleProp ||
    (normalizedSupport.length > 0
      ? normalizedSupport.includes(defaultLanguage)
        ? defaultLanguage
        : normalizedSupport[0]
      : 'zh-CN');
  const allowedValues = useMemo(() => list.map(item => item.value), [list]);

  const initLocale = useRefCallback(() => {
    const cachedLocale = localStorage.getItem('X-User-Locale');
    let targetLocale;

    // 仅一种语言时强制走默认语言（忽略缓存），保证租户默认语言生效
    if (allowedValues.length <= 1) {
      targetLocale = allowedValues.indexOf(defaultLocale) > -1 ? defaultLocale : allowedValues[0];
    } else if (!cachedLocale || allowedValues.indexOf(cachedLocale) === -1) {
      targetLocale = allowedValues.indexOf(defaultLocale) > -1 ? defaultLocale : allowedValues[0];
    } else {
      targetLocale = cachedLocale;
    }

    if (targetLocale && targetLocale !== locale) {
      setGlobal(targetLocale);
    }
    if (targetLocale && targetLocale !== cachedLocale) {
      localStorage.setItem('X-User-Locale', targetLocale);
    }
  });

  useEffect(() => {
    initLocale();
  }, [initLocale, allowedValues.join(','), defaultLocale]);

  // 超过一种语言才展示切换；单语言只应用默认，不渲染控件
  if (list.length <= 1) {
    return null;
  }

  return (
    <LanguageField
      {...props}
      list={list}
      defaultLocale={defaultLocale}
      locale={locale}
      onChange={nextLocale => {
        setGlobal(nextLocale);
        localStorage.setItem('X-User-Locale', nextLocale);
      }}
    />
  );
};

/**
 * 未传 supportLanguage / list 时默认中/英。
 * 租户场景传 supportLanguage / defaultLanguage：多于一种显示切换，仅一种则强制默认语言。
 */
const Language = createWithRemoteLoader({
  modules: ['components-core:Global@useGlobalValue', 'components-core:Global@useGlobalContext']
})(({ remoteModules, list: listProp, defaultLocale: defaultLocaleProp, supportLanguage, defaultLanguage = 'zh-CN', ...props }) => {
  const [useGlobalValue, useGlobalContext] = remoteModules;
  const locale = useGlobalValue('locale');
  const { setGlobal } = useGlobalContext('locale');

  return (
    <LanguageInner
      {...props}
      locale={locale}
      setGlobal={setGlobal}
      list={listProp}
      defaultLocale={defaultLocaleProp}
      supportLanguage={supportLanguage}
      defaultLanguage={defaultLanguage}
    />
  );
});

export default Language;
