import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import merge from 'lodash/merge';
import withLocale from '../withLocale';

const FormInnerCore = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules, apis, orgId }) => {
  const [FormInfo] = remoteModules;
  const { formatMessage } = useIntl();
  const { Input, TextArea, SuperSelect } = FormInfo.fields;
  const list = [
    <Input name="name" label={formatMessage({ id: 'OrgName' })} rule="REQ LEN-0-100" />,
    <TextArea name="description" label={formatMessage({ id: 'OrgDescription' })} rule="LEN-0-500" />
  ];
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
        description={
          orgId
            ? formatMessage({ id: 'OrgLeaderMustBeMember' })
            : formatMessage({ id: 'OrgLeaderCreateHint' })
        }
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

/** withLocale 在外层：弹窗/Portal 内仍能加载 Tenant 命名空间文案，且正常转发 apis 等 props */
export default withLocale(FormInnerCore);
