import RegisterComponent from '../Register';
import {useProps} from './context';
import useNavigate from '@kne/use-refer-navigate';
import {createWithRemoteLoader} from '@kne/remote-loader';
import merge from 'lodash/merge';
import md5 from 'md5';
import {App} from 'antd';

const Register = createWithRemoteLoader({
    modules: ['component-core:Global@usePreset']
})(({remoteModules}) => {
    const [usePreset] = remoteModules;
    const {apis: presetApis, ajax} = usePreset();
    const {apis, accountType, loginUrl, registerTitle} = useProps();
    const navigate = useNavigate();
    const {message} = App.useApp();
    const account = Object.assign({}, presetApis.account, apis);

    return (
        <RegisterComponent type={accountType} loginUrl={loginUrl} title={registerTitle} validateCode={async data => {
            const {data: resData} = await ajax(merge({}, account.validateCode, {
                data
            }));
            if (resData.code !== 0) {
                return {result: false, errMsg: resData.msg || '%s不正确'};
            }

            return {result: true};
        }} sendVerificationCode={async ({type, data}) => {
            const {data: resData} = await ajax(merge({}, type === 'phone' ? account.sendSMSCode : account.sendEmailCode, {
                data: {[type]: data}
            }));
            if (resData.code !== 0) {
                return false;
            }
            message.success(`验证码已发送至您的${type === 'phone' ? '手机' : '邮箱'}，请查收`);
        }} onSubmit={async formData => {
            const newPwd = md5(formData.password);
            const {data: resData} = await ajax(merge({}, account.register, {
                data: {
                    type: accountType,
                    email: formData.email,
                    phone: formData.phone,
                    password: newPwd,
                    code: formData.code
                }
            }));
            if (resData.code !== 0) {
                return;
            }
            message.success('注册成功');
            navigate(loginUrl);
        }}
        />);
});

export default Register;
