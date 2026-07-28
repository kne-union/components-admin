import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { createContext, useContext, useMemo } from 'react';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import TenantUserSelectInputControl from './TenantUserSelectInputControl';

const CONFIG_KEYS = [
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
  'labelKey',
  'isPopup',
  'overlayWidth'
];

const InputFieldContext = createContext(null);

const InputControl = props => {
  const ctx = useContext(InputFieldContext);
  return <TenantUserSelectInputControl {...ctx} {...props} />;
};

/**
 * Form Field：useOnChange 接入表单（与 SuperSelect 一致）。
 * .Field 为纯控件，可在非 Form 场景使用 value/onChange。
 */
const OrgTenantUserSelectInput = createWithRemoteLoader({
  modules: ['components-core:FormInfo@hooks']
})(
  withLocale(({ remoteModules, orgApi, userApi, userStatus, companyName, showOrgRoot = true, single = true, showSelectedFooter = true, allowSelectAll = true, initialSelectedMeta, height = 480, valueKey = 'id', labelKey = 'name', isPopup = true, overlayWidth = 720, ...props }) => {
    const [hooks] = remoteModules;
    const { useOnChange } = hooks;
    const { formatMessage } = useIntl();
    const fieldProps = omit(props, CONFIG_KEYS);
    const render = useOnChange(
      merge(
        {
          interceptor: single ? 'object-output-value' : 'array-output-value',
          placeholder: formatMessage({ id: 'TenantUserSelectPlaceholder' })
        },
        fieldProps
      )
    );

    const contextValue = useMemo(
      () => ({
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
        labelKey,
        isPopup,
        overlayWidth
      }),
      [orgApi, userApi, userStatus, companyName, showOrgRoot, single, showSelectedFooter, allowSelectAll, initialSelectedMeta, height, valueKey, labelKey, isPopup, overlayWidth]
    );

    return (
      <InputFieldContext.Provider value={contextValue}>
        {render(InputControl)}
      </InputFieldContext.Provider>
    );
  })
);

OrgTenantUserSelectInput.Field = withLocale(
  ({ orgApi, userApi, userStatus, companyName, showOrgRoot = true, single = true, showSelectedFooter = true, allowSelectAll = true, initialSelectedMeta, height = 480, valueKey = 'id', labelKey = 'name', isPopup = true, overlayWidth = 720, ...props }) => (
    <TenantUserSelectInputControl
      {...omit(props, CONFIG_KEYS)}
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
      isPopup={isPopup}
      overlayWidth={overlayWidth}
    />
  )
);

export default OrgTenantUserSelectInput;
