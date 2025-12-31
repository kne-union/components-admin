import commonStyle from '../style.module.scss';
import {createWithRemoteLoader} from '@kne/remote-loader';
import useNavigate from '@kne/use-refer-navigate';
import classnames from 'classnames';
import {LeftOutlined} from '@ant-design/icons';
import {Space, Button} from 'antd';
import {useState} from 'react';
import style from './style.module.scss';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const ForgetInner = createWithRemoteLoader({
    modules: ['components-core:FormInfo']
})(({remoteModules, ...p}) => {
    const {formatMessage} = useIntl();
    const {title, loginUrl, onSubmit} = Object.assign({}, {
        title: formatMessage({ id: 'Forget' }), loginUrl: ''
    }, p);
    const [resultEmail, setResultEmail] = useState('');
    const navigate = useNavigate();
    const [FormInfo] = remoteModules;
    const {Form, fields, SubmitButton} = FormInfo;
    const {Input} = fields;

    const header = <Button className={commonStyle['back-link']} type="link" size="large" icon={<LeftOutlined/>}
                           onClick={() => {
                               navigate(loginUrl);
                           }}>{formatMessage({ id: 'BackToLogin' })}</Button>;
    if (resultEmail) {
        return <>
            {header}
            <Space className={classnames(style['main'], 'space-full')} direction="vertical" size={40}>
                <div className={commonStyle['title']}>{title}</div>
                <div className={style['success-info']}>
                    <div>{formatMessage({ id: 'ResetLinkSent' }, { s: resultEmail })}</div>
                    <div>{formatMessage({ id: 'ResetLinkExpire' })}</div>
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
                <Input name="email" label={formatMessage({ id: 'EmailAccount' })} rule="REQ EMAIL"/>
            </Space>
            <Space className="space-full" direction="vertical">
                <SubmitButton block size="large">
                    {formatMessage({ id: 'NextStep' })}
                </SubmitButton>
            </Space>
        </Space>
    </Form>
});

export default withLocale(ForgetInner);
