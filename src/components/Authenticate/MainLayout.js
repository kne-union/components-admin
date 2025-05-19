import {createWithRemoteLoader} from '@kne/remote-loader';
import {Outlet} from 'react-router-dom';
import {SuperAdminInfo, UserInfo} from './Authenticate';

const Global = createWithRemoteLoader({
    modules: ['components-core:Global']
})(({remoteModules, preset, children, ...props}) => {
    const [Global] = remoteModules;
    return <Global {...props} preset={preset}>
        {children}
    </Global>;
});

const GlobalLayoutInner = createWithRemoteLoader({
    modules: ['components-core:Layout']
})(({remoteModules, navigation, title, children}) => {
    const [Layout] = remoteModules;
    return (<Layout
        navigation={{
            defaultTitle: title, ...Object.assign({}, navigation)
        }}
    >
        {children}
    </Layout>);
});

const GlobalLayout = createWithRemoteLoader({
    modules: ['components-core:Global']
})(({remoteModules, navigation, title, preset, children, ...props}) => {
    const [Global] = remoteModules;
    return (<Global {...props} preset={preset}>
        <GlobalLayoutInner {...{navigation, title, children}} />
    </Global>);
});

export const MainLayout = props => {
    return (<GlobalLayout {...props}>
        <Outlet/>
    </GlobalLayout>);
};

export const AfterUserLoginLayout = ({baseUrl, ...props}) => {
    return (<GlobalLayout {...props}>
        <UserInfo baseUrl={baseUrl || "/account"}>
            <Outlet/>
        </UserInfo>
    </GlobalLayout>);
};

export const AfterAdminUserLoginLayout = props => {
    return (<GlobalLayout {...props}>
        <SuperAdminInfo>
            <Outlet/>
        </SuperAdminInfo>
    </GlobalLayout>);
};

export const BeforeLoginLayout = props => {
    return (<Global {...props}>
        <Outlet/>
    </Global>);
};