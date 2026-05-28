import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import merge from 'lodash/merge';
import withLocale from '../withLocale';

const LeaderFormInnerCore = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules, apis, orgId }) => {
  const [FormInfo] = remoteModules;
  const { formatMessage } = useIntl();
  const { SuperSelect } = FormInfo.fields;
  const list = [];
  if (apis?.userList) {
    list.push(
      <SuperSelect
        name="leaderUserId"
        label={formatMessage({ id: 'OrgLeader' })}
        api={merge({}, apis.userList, {
          params: merge(
            { perPage: 100, currentPage: 1 },
            apis.userList.params || {},
            orgId ? { filter: { tenantOrgId: orgId } } : {}
          )
        })}
        description={formatMessage({ id: 'OrgLeaderMustBeMember' })}
        interceptor="object-output-value"
        valueKey="id"
        labelKey="name"
        single
        allowClear
      />
    );
  }
  return <FormInfo column={1} list={list} />;
});

export default withLocale(LeaderFormInnerCore);
