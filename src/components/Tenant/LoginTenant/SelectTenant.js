import { createWithRemoteLoader } from '@kne/remote-loader';
import { Card, List, Flex, Button, App, Badge } from 'antd';
import Fetch from '@kne/react-fetch';
import { useState } from 'react';
import classnames from 'classnames';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import style from './style.module.scss';

const SelectTenant = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Image', 'components-core:InfoPage@SplitLine', 'components-core:Icon']
})(({ remoteModules, tenantPath }) => {
  const [usePreset, Image, SplitLine, Icon] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  return (
    <Card title={formatMessage({ id: 'SelectLoginTenant' })}>
      <Fetch
        {...Object.assign({}, apis.tenant.availableList)}
        render={({ data, reload }) => {
          const currentTenantUser = data.list.find(item => item.tenantId === data.defaultTenantId);
          return (
            <Flex vertical gap={60}>
              <List
                loading={loading}
                dataSource={data.list}
                renderItem={item => {
                  const itemInner = (
                    <List.Item.Meta
                      avatar={<Image id={item.tenant?.tenantCompany?.logo || item.tenant?.logo} className={style['tenant-avatar']} />}
                      title={item.tenant?.tenantCompany?.name}
                      description={
                        <SplitLine
                          dataSource={item}
                          columns={[
                            {
                              name: 'name',
                              title: formatMessage({ id: 'Name' })
                            },
                            {
                              name: 'tenantOrg.name',
                              title: formatMessage({ id: 'Department' })
                            }
                          ]}
                        />
                      }
                    />
                  );
                  const isSelected = item.tenantId === data.defaultTenantId;
                  return (
                    <List.Item
                      key={item.id}
                      onClick={async () => {
                        if (isSelected || item.status !== 'open') {
                          return;
                        }
                        setLoading(true);
                        const { data: resData } = await ajax(
                          Object.assign({}, apis.tenant.switchDefaultTenant, {
                            data: { tenantId: item.tenantId }
                          })
                        );
                        if (resData.code !== 0) {
                          setLoading(false);
                          return;
                        }
                        message.success(formatMessage({ id: 'SwitchDefaultTenantSuccess' }));
                        reload();
                        setLoading(false);
                      }}
                      className={classnames(style['tenant-item'], {
                        [style['is-selected']]: isSelected,
                        [style['is-disabled']]: item.status !== 'open'
                      })}>
                      {(() => {
                        if (item.status !== 'open') {
                          return (
                            <Badge.Ribbon text={formatMessage({ id: 'TenantUserCannotUse' })} color="#CCCCCC">
                              {itemInner}
                            </Badge.Ribbon>
                          );
                        }
                        if (isSelected) {
                          return <Badge.Ribbon text={formatMessage({ id: 'CurrentTenant' })}>{itemInner}</Badge.Ribbon>;
                        }
                        return itemInner;
                      })()}
                    </List.Item>
                  );
                }}
              />
              {data.list.length > 0 && (
                <Flex justify="center">
                  <Button
                    disabled={!(currentTenantUser && currentTenantUser.status === 'open')}
                    type="primary"
                    size="large"
                    onClick={() => {
                      window.location.href = tenantPath;
                    }}>
                    {formatMessage({ id: 'EnterTenant' })}
                    <Icon type="fasongduihua" />
                  </Button>
                </Flex>
              )}
            </Flex>
          );
        }}
      />
    </Card>
  );
});

export default withLocale(SelectTenant);
