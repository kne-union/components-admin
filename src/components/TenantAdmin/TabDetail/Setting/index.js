import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState, useMemo } from 'react';
import { Flex } from 'antd';
import get from 'lodash/get';
import { isManagedTenant } from '@components/Tenant';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';
import Args from './Args';
import CustomComponents from './CustomComponents';
import Language from './Language';
import MailSetting from './MailSetting';
import style from './style.module.scss';

const builtinContentMap = {
  args: Args,
  customComponents: CustomComponents,
  language: Language,
  mailSetting: MailSetting
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
      showBuiltinLanguageOptions: showBuiltinLanguageOptionsProp,
      appendSettingMenus: appendSettingMenusProp
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
      const appendSettingMenus =
        appendSettingMenusProp !== void 0
          ? appendSettingMenusProp
          : get(plugins, 'admin.tenant.appendSettingMenus', []) || [];

      const managed = isManagedTenant(tenant);
      const { menuItems, contentMap } = useMemo(() => {
        const items = [
          {
            key: 'args',
            label: formatMessage({ id: 'EnvironmentVariables' })
          },
          {
            key: 'customComponents',
            label: formatMessage({ id: 'CustomComponents' })
          },
          {
            key: 'mailSetting',
            label: formatMessage({ id: 'MailSetting' })
          }
        ];
        // 托管租户的语言由宿主同步，本地不可改
        if (showLanguageSetting && !managed) {
          items.push({
            key: 'language',
            label: formatMessage({ id: 'LanguageSetting' })
          });
        }
        const map = Object.assign({}, builtinContentMap);
        (Array.isArray(appendSettingMenus) ? appendSettingMenus : []).forEach(item => {
          if (!item || !item.key || !item.component) {
            return;
          }
          const menuItem = {
            key: item.key,
            label: item.label || item.tab || item.key
          };
          if (Number.isInteger(item.index) && item.index >= 0) {
            items.splice(item.index, 0, menuItem);
          } else {
            items.push(menuItem);
          }
          map[item.key] = item.component;
        });
        return { menuItems: items, contentMap: map };
      }, [formatMessage, showLanguageSetting, managed, appendSettingMenus]);

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
