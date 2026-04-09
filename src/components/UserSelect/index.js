import { createWithRemoteLoader } from '@kne/remote-loader';

const createComponent = (callback = item => item) => {
  return createWithRemoteLoader({
    modules: ['components-core:Global@usePreset', 'components-core:FormInfo']
  })(({ remoteModules, status = 0, api, ...props }) => {
    const [usePreset, FormInfo] = remoteModules;
    const { apis } = usePreset();
    const { SuperSelectUser } = FormInfo.fields;
    const Component = callback(SuperSelectUser);
    return (
      <Component
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
};

const UserSelect = createComponent();

UserSelect.Field = createComponent(item => item.Field);

export default UserSelect;
