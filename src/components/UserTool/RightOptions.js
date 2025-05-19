import {createWithRemoteLoader} from '@kne/remote-loader';
import UserTool from './UserTool';

const RightOptions = createWithRemoteLoader({
    modules: ['components-core:Global@GetGlobal']
})(({remoteModules}) => {
    const [GetGlobal] = remoteModules;

    return (<GetGlobal globalKey="userInfo">
        {({value}) => {
            if (!value) {
                return null;
            }
            const {userInfo, tenantUser, tenant} = value;
            return (<UserTool
                avatar={tenantUser ? tenantUser.avatar : userInfo.avatar}
                name={tenantUser ? tenantUser.name : userInfo.nickname}
                email={tenantUser ? tenantUser.email : userInfo.email}
                tenant={tenant}
                orgName={tenantUser && (tenantUser?.tenantOrgs || []).map(item => item.name).join(',')}
            />);
        }}
    </GetGlobal>);
});

export default RightOptions;
