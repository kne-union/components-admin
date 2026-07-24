import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState, useMemo } from 'react';
import { Flex } from 'antd';
import get from 'lodash/get';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';
import Args from './Args';
import CustomComponents from './CustomComponents';
import Language from './Language';
import style from './style.module.scss';

const contentMap = {
  args: Args,
  customComponents: CustomComponents,
  language: Language
};

const Setting = createWithRemoteLoader({
  modules: ['components-core:Menu', 'components-core:Global@usePreset']
})(
  withLocale(
    ({
      remoteModules,
      tenant,
      reload,
      showLanguageSetting: showLanguageSettingProp,
      languageOptionsApi: languageOptionsApiProp,
      showBuiltinLanguageOptions: showBuiltinLanguageOptionsProp
    }) => {
      const [Menu, usePreset] = remoteModules;
      const { plugins } = usePreset();
      const { formatMessage } = useIntl();

      const showLanguageSetting =
        showLanguageSettingProp !== void 0
          ? showLanguageSettingProp
          : !!get(plugins, 'admin.tenant.showLanguageSetting', false);
      const languageOptionsApi =
        languageOptionsApiProp !== void 0
          ? languageOptionsApiProp
          : get(plugins, 'admin.tenant.languageOptionsApi');
      const showBuiltinLanguageOptions =
        showBuiltinLanguageOptionsProp !== void 0
          ? showBuiltinLanguageOptionsProp
          : !!get(plugins, 'admin.tenant.showBuiltinLanguageOptions', false);

      const menuItems = useMemo(() => {
        const items = [
          {
            key: 'args',
            label: formatMessage({ id: 'EnvironmentVariables' })
          },
          {
            key: 'customComponents',
            label: formatMessage({ id: 'CustomComponents' })
          }
        ];
        if (showLanguageSetting) {
          items.push({
            key: 'language',
            label: formatMessage({ id: 'LanguageSetting' })
          });
        }
        return items;
      }, [formatMessage, showLanguageSetting]);

      const [activeKey, setActiveKey] = useState('args');
      const resolvedActiveKey = menuItems.some(item => item.key === activeKey) ? activeKey : 'args';
      const Content = contentMap[resolvedActiveKey] || Args;

      return (
        <Flex className={style['setting']} gap={0}>
          <div className={style['setting-menu']}>
            <Menu currentKey={resolvedActiveKey} onChange={setActiveKey} items={menuItems} />
          </div>
          <div className={style['setting-content']}>
            <Content
              tenant={tenant}
              reload={reload}
              languageOptionsApi={languageOptionsApi}
              showBuiltinLanguageOptions={showBuiltinLanguageOptions}
            />
          </div>
        </Flex>
      );
    }
  )
);

export default Setting;
