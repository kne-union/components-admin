import { SelectInput } from '@kne/super-select';
import '@kne/super-select/dist/index.css';
import classnames from 'classnames';
import { useIntl } from '@kne/react-intl';
import TenantUserSelectPanel from './TenantUserSelectPanel';
import style from './style.module.scss';

const toPanelValue = (value, single) => {
  if (single) {
    if (Array.isArray(value)) {
      return value.length > 0 ? value[value.length - 1] : null;
    }
    return value || null;
  }
  return Array.isArray(value) ? value : [];
};

const toSelectInputValue = (next, single) => {
  if (single) {
    return next ? [next] : [];
  }
  return Array.isArray(next) ? next : [];
};

/**
 * 基于 SelectInput 的组织成员选择控件（非 Form Field）。
 * isPopup=true 为下拉；isPopup=false 为弹窗。
 */
const TenantUserSelectInputControl = ({
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
  height = 480,
  valueKey = 'id',
  labelKey = 'name',
  isPopup = true,
  placeholder,
  overlayWidth = 720,
  className,
  ...props
}) => {
  const { formatMessage } = useIntl();
  const resolvedPlaceholder = placeholder || formatMessage({ id: 'TenantUserSelectPlaceholder' });

  return (
    <SelectInput
      {...props}
      className={classnames(style['select-input'], className)}
      value={value}
      onChange={onChange}
      disabled={disabled}
      single={single}
      isPopup={isPopup}
      placeholder={resolvedPlaceholder}
      valueKey={valueKey}
      labelKey={labelKey}
      overlayWidth={overlayWidth}
      overlayClassName={classnames(style['select-input-overlay'], props.overlayClassName)}
    >
      {contextProps => {
        if (!contextProps.open) {
          return null;
        }
        const { value: contextValue, setValue, onOpenChange } = contextProps;
        return (
          <div
            onMouseDown={e => {
              // 避免下拉内点击时 Input 失焦导致 Dropdown 关闭
              e.preventDefault();
            }}
          >
            <TenantUserSelectPanel
              className={style['select-input-panel']}
              value={toPanelValue(contextValue, single)}
              onChange={next => {
                setValue(toSelectInputValue(next, single));
              }}
              onSelectComplete={next => {
                // 仅成员点选完成时关闭下拉；切组织清空/回填不要关
                if (isPopup && single && next) {
                  onOpenChange(false);
                }
              }}
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
          </div>
        );
      }}
    </SelectInput>
  );
};

export default TenantUserSelectInputControl;
