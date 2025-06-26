import { createWithRemoteLoader } from '@kne/remote-loader';

const UserSelect = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:FormInfo']
})(({ remoteModules, status = 0, api, ...props }) => {
  const [usePreset, FormInfo] = remoteModules;
  const { apis } = usePreset();
  const { SuperSelectUser } = FormInfo.fields;
  return (
    <SuperSelectUser
      {...props}
      api={Object.assign(
        {},
        apis.admin.getUserList,
        {
          data: {
            filter: Object.assign(
              {},
              Number.isInteger(status) && {
                status
              }
            )
          },
          transformData: data => {
            return Object.assign({}, data, {
              pageData: (data.pageData || []).map(item =>
                Object.assign({}, item, {
                  value: item.id,
                  label: item.nickname || item.email || item.phone
                })
              )
            });
          }
        },
        api
      )}
    />
  );
});

export default UserSelect;
