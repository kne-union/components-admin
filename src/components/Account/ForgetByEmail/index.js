import commonStyle from '../style.module.scss';
import {createWithRemoteLoader} from '@kne/remote-loader';
import useNavigate from '@kne/use-refer-navigate';
import classnames from 'classnames';
import {LeftOutlined} from '@ant-design/icons';
import {Space, Button} from 'antd';
import {useState} from 'react';
import style from './style.module.scss';

const Forget = createWithRemoteLoader({
    modules: ['components-core:FormInfo']
})(({remoteModules, ...p}) => {
    const {title, loginUrl, onSubmit} = Object.assign({}, {
        title: '忘记密码', loginUrl: ''
    }, p);
    const [resultEmail, setResultEmail] = useState('');
    const navigate = useNavigate();
    const [FormInfo] = remoteModules;
    const {Form, fields, SubmitButton} = FormInfo;
    const {Input} = fields;

    const header = <Button className={commonStyle['back-link']} type="link" size="large" icon={<LeftOutlined/>}
                           onClick={() => {
                               navigate(loginUrl);
                           }}>返回登录</Button>;
    if (resultEmail) {
        return <>
            {header}
            <Space className={classnames(style['main'], 'space-full')} direction="vertical" size={40}>
                <div className={commonStyle['title']}>{title}</div>
                <div className={style['success-info']}>
                    <div>重置链接已发送至{resultEmail}的邮箱中，</div>
                    <div>请在3分钟内完成密码重置，若链接失效请重新申请。</div>
                </div>
            </Space>
        </>
    }

    return <Form type="inner"
                 size="large"
                 onSubmit={formData => {
                     onSubmit && onSubmit(formData, () => {
                         setResultEmail(formData.email);
                     });
                 }}>
        {header}
        <Space className={classnames(style['main'], 'space-full')} direction="vertical" size={40}>
            <div className={commonStyle['title']}>{title}</div>
            <Space className={classnames('space-full', style['forget-input'])} direction="vertical">
                <Input name="email" label="邮箱账号" rule="REQ EMAIL"/>
            </Space>
            <Space className="space-full" direction="vertical">
                <SubmitButton block size="large">
                    下一步
                </SubmitButton>
            </Space>
        </Space>
    </Form>
});

export default Forget;
