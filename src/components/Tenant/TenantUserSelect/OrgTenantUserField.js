import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { createContext, useContext, useMemo } from 'react';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import TenantUserSelectPanel from './TenantUserSelectPanel';

const PanelFieldContext = createContext(null);

const PanelControl = ({ value, onChange, disabled }) => {
  const ctx = useContext(PanelFieldContext);
  return (
    <TenantUserSelectPanel
      value={value}
      onChange={onChange}
      disabled={disabled}
      {...ctx}
    />
  );
};

const OrgTenantUserField = createWithRemoteLoader({
  modules: ['components-core:FormInfo@hooks']
})(
  withLocale(({ remoteModules, orgApi, userApi, userStatus, companyName, showOrgRoot = true, single = true, showSelectedFooter = true, allowSelectAll = true, initialSelectedMeta, height, valueKey = 'id', labelKey = 'name', ...props }) => {
    const [hooks] = remoteModules;
    const { useDecorator } = hooks;
    const { formatMessage } = useIntl();
    const fieldProps = omit(props, [
      'remoteModules',
      'orgApi',
      'userApi',
      'userStatus',
      'companyName',
      'showOrgRoot',
      'single',
      'showSelectedFooter',
      'allowSelectAll',
      'initialSelectedMeta',
      'height',
      'valueKey',
      'labelKey'
    ]);
    const render = useDecorator(
      merge(
        {
          interceptor: single ? 'object-output-value' : 'array-output-value'
        },
        fieldProps
      )
    );

    const contextValue = useMemo(
      () => ({
        formatMessage,
        orgApi,
        userApi,
        userStatus,
        companyName,
        showOrgRoot,
        single,
        showSelectedFooter,
        allowSelectAll,
        initialSelectedMeta,
        height,
        valueKey,
        labelKey
      }),
      [formatMessage, orgApi, userApi, userStatus, companyName, showOrgRoot, single, showSelectedFooter, allowSelectAll, initialSelectedMeta, height, valueKey, labelKey]
    );

    return (
      <PanelFieldContext.Provider value={contextValue}>
        {render(PanelControl)}
      </PanelFieldContext.Provider>
    );
  })
);

OrgTenantUserField.Field = withLocale(
  ({
    value,
    onChange,
    disabled,
    orgApi,
    userApi,
    userStatus,
    companyName,
    showOrgRoot = true,
    single = true,
    showSelectedFooter = true,
    allowSelectAll = true,
    initialSelectedMeta,
    height,
    valueKey = 'id',
    labelKey = 'name'
  }) => {
    const { formatMessage } = useIntl();
    return (
      <TenantUserSelectPanel
        value={value}
        onChange={onChange}
        disabled={disabled}
        formatMessage={formatMessage}
        orgApi={orgApi}
        userApi={userApi}
        userStatus={userStatus}
        companyName={companyName}
        showOrgRoot={showOrgRoot}
        single={single}
        showSelectedFooter={showSelectedFooter}
        allowSelectAll={allowSelectAll}
        initialSelectedMeta={initialSelectedMeta}
        height={height}
        valueKey={valueKey}
        labelKey={labelKey}
      />
    );
  }
);

export default OrgTenantUserField;
