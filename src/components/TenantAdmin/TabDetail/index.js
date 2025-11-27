import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useSearchParams } from 'react-router-dom';
import Actions from '../Actions';
import dayjs from 'dayjs';
import Company from './Company';
import Org from './Org';
import User from './User';
import Setting from './Setting';

const contentMap = {
  company: Company,
  org: Org,
  user: User,
  setting: Setting
};

const TabDetail = createWithRemoteLoader({
  modules: ['components-core:Layout@StateBarPage', 'components-core:Global@usePreset', 'components-core:Layout@PageHeader', 'components-core:StateTag', 'components-core:InfoPage', 'components-core:Descriptions']
})(({ remoteModules, ...props }) => {
  const [StateBarPage, usePreset, PageHeader, StateTag] = remoteModules;
  const { apis } = usePreset();
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <Fetch
      {...Object.assign({}, apis.tenantAdmin.detail, { params: { id: searchParams.get('id') } })}
      render={({ data, reload }) => {
        const activeKey = searchParams.get('tab') || 'company';
        const ContentComponent = contentMap[activeKey] || Company;
        return (
          <StateBarPage
            {...props}
            headerFixed={false}
            header={
              <PageHeader
                title={data.name}
                info={`ID: ${data.id}`}
                tags={[
                  data.status === 'open' ? <StateTag type="success" text="开启" /> : <StateTag type="danger" text="关闭" />,
                  `服务时间:${dayjs(data.serviceStartTime).format('YYYY-MM-DD')}~${dayjs(data.serviceEndTime).format('YYYY-MM-DD')}`,
                  `开通账号数:${data.accountCount}`
                ]}
                buttonOptions={
                  <Actions
                    data={data}
                    onSuccess={() => {
                      reload();
                    }}
                  />
                }
              />
            }
            stateBar={{
              activeKey,
              onChange: key => {
                searchParams.set('tab', key);
                setSearchParams(searchParams.toString());
              },
              stateOption: [
                { tab: '公司信息', key: 'company' },
                { tab: '组织架构', key: 'org' },
                { tab: '用户管理', key: 'user' },
                {
                  tab: '设置',
                  key: 'setting'
                }
              ]
            }}
          >
            <ContentComponent tenant={data} reload={reload} />
          </StateBarPage>
        );
      }}
    />
  );
});

export default TabDetail;
