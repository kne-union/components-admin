import { createWithRemoteLoader } from '@kne/remote-loader';
import useControlValue from '@kne/use-control-value';
import Fetch from '@kne/react-fetch';
import { App, Menu, Checkbox, Flex, Divider, Empty, Button } from 'antd';
import flattenPermissions from './flattenPermissions';
import { useState } from 'react';
import get from 'lodash/get';
import merge from 'lodash/merge';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import style from './style.module.scss';

export const PermissionPanel = createWithRemoteLoader({
  modules: ['components-core:Common@SimpleBar']
})(
  withLocale(({ remoteModules, settings, disabled = false, ...props }) => {
    const [value, onChange] = useControlValue(props);
    const [SimpleBar] = remoteModules;
    const { formatMessage } = useIntl();
    const [currentList, setCurrentList] = useState([0]);
    const allPermission = flattenPermissions(settings).map(({ code }) => code);
    const onCheckedChange = ({ itemCode, checked, parentCodeList }) => {
      onChange(value => {
        if (checked) {
          return value.slice(0).concat(parentCodeList).concat(itemCode);
        } else {
          return value.slice(0).filter(item => item.indexOf(itemCode) !== 0);
        }
      });
    };
    const renderCol = ({
      code = '',
      parentCodeString = '',
      parentCodeList = [],
      modules,
      permissions,
      onActiveChange,
      currentIndex = 0,
      level = 0
    }) => {
      const valueCode = `${parentCodeString ? `${parentCodeString}:` : ''}${code}`;
      return (
        <>
          <Flex vertical className={style['permission-panel-col']} key={code || 'root'}>
            {modules && modules.length > 0 && (
              <Menu
                className={style['modules-menu']}
                selectedKeys={[modules[currentIndex].code]}
                onSelect={({ key }) => {
                  const currentIndex = modules.findIndex(item => item.code === key);
                  onActiveChange(currentIndex, level);
                }}
                items={modules.map(({ code, name }) => {
                  const itemCode = `${valueCode ? `${valueCode}:` : ''}${code}`;
                  const checked = value.indexOf(itemCode) > -1;
                  const hasAllChildren = allPermission.filter(code => code.indexOf(itemCode) === 0).every(code => value.indexOf(code) > -1);
                  return {
                    key: code,
                    label: (
                      <Flex gap={8} align="center" justify="space-between">
                        <Flex>
                          <Checkbox
                            checked={checked}
                            disabled={disabled}
                            onChange={e =>
                              onCheckedChange({
                                itemCode,
                                checked: e.target.checked,
                                parentCodeList: valueCode ? parentCodeList.concat(valueCode) : parentCodeList
                              })
                            }
                          />
                          <div>{name}</div>
                        </Flex>
                        {!disabled && !hasAllChildren && (
                          <Button
                            type="link"
                            className="btn-no-padding"
                            onClick={() => {
                              onChange(value => {
                                const currentChildren = allPermission.filter(code => code.indexOf(itemCode) === 0 && value.indexOf(code) === -1);
                                return value.slice(0).concat(currentChildren);
                              });
                            }}
                          >
                            {formatMessage({ id: 'SelectAll' })}
                          </Button>
                        )}
                      </Flex>
                    )
                  };
                })}
              />
            )}
            {modules && modules.length > 0 && permissions && permissions.length > 0 && <Divider />}
            {permissions && permissions.length > 0 && (
              <div className={style['permission-panel']}>
                {permissions.map(item => {
                  const itemCode = `${valueCode ? `${valueCode}:` : ''}${item.code}`;
                  return (
                    <Checkbox
                      key={item.code}
                      checked={value.indexOf(itemCode) > -1}
                      disabled={disabled}
                      onChange={e =>
                        onCheckedChange({
                          itemCode,
                          checked: e.target.checked,
                          parentCodeList: valueCode ? parentCodeList.concat(valueCode) : parentCodeList
                        })
                      }
                    >
                      {item.name}
                    </Checkbox>
                  );
                })}
              </div>
            )}
          </Flex>
          {modules &&
            modules.length > 0 &&
            renderCol(
              Object.assign({}, get(modules, `[${currentIndex}]`), {
                currentIndex: currentList[level + 1] || 0,
                level: level + 1,
                parentCodeString: valueCode,
                parentCodeList: valueCode ? parentCodeList.concat(valueCode) : [],
                onActiveChange
              })
            )}
          {!(permissions && permissions.length > 0) && !(modules && modules.length > 0) && <Empty className={style['empty']} />}
        </>
      );
    };

    return (
      <SimpleBar className={style['permission-panel-scroller']}>
        <Flex className={style['permission-panel-wrapper']}>
          {renderCol(
            Object.assign({}, settings, {
              currentIndex: currentList[0] || 0,
              onActiveChange: (index, level) => {
                setCurrentList(currentList.slice(0, level).concat(index));
              }
            })
          )}
        </Flex>
      </SimpleBar>
    );
  })
);

const isSameCodes = (a, b) => {
  const left = new Set(a);
  const right = new Set(b);
  return left.size === right.size && [...left].every(code => right.has(code));
};

// 保存会让相关用户重新登录，改动先留在本地，点保存后一次性提交
const TenantPermissionEditor = ({ ajax, apis, permissions, codes, disabled, reload }) => {
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  const [value, setValue] = useState(codes);
  const [saving, setSaving] = useState(false);
  const dirty = !isSameCodes(value, codes);
  return (
    <Flex vertical gap={8}>
      <PermissionPanel settings={permissions} value={value} disabled={disabled || saving} onChange={setValue} />
      {!disabled && dirty && (
        <Flex justify="flex-end" gap={8} className={style['footer']}>
          <Button disabled={saving} onClick={() => setValue(codes)}>
            {formatMessage({ id: 'Cancel' })}
          </Button>
          <Button
            type="primary"
            loading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                const { data: resData } = await ajax(merge({}, apis.save, { data: { permissions: [...new Set(value)] } }));
                if (resData.code !== 0) {
                  return;
                }
                message.success(formatMessage({ id: 'SaveSuccess' }));
                reload();
              } finally {
                setSaving(false);
              }
            }}
          >
            {formatMessage({ id: 'Save' })}
          </Button>
        </Flex>
      )}
    </Flex>
  );
};

const TenantPermission = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, apis, disabled = false, children }) => {
    const [usePreset] = remoteModules;
    const { ajax } = usePreset();
    const target = (
      <div className={style['tenant-permission']}>
        <Fetch
          {...Object.assign({}, apis.list)}
          render={({ data, reload }) => {
            const { permissions, codes } = data;
            return (
              <TenantPermissionEditor
                key={(codes || []).join(',')}
                ajax={ajax}
                apis={apis}
                permissions={permissions}
                codes={codes || []}
                disabled={disabled}
                reload={reload}
              />
            );
          }}
        />
      </div>
    );

    if (typeof children === 'function') {
      return children({
        children: target
      });
    }

    return target;
  })
);

export default TenantPermission;
