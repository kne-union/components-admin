import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';
import style from '../style.module.scss';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(withLocale(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { formatMessage } = useIntl();
  const { Input, TextArea } = FormInfo.fields;

  return (
    <FormInfo
      className={style['form-section']}
      list={[
        <Input name="name" label={formatMessage({ id: 'CompanyName' })} rule="REQ LEN-0-100" />,
        <Input name="fullName" label={formatMessage({ id: 'CompanyFullName' })} rule="LEN-0-100" />,
        <Input name="website" label={formatMessage({ id: 'CompanyWebsite' })} rule="LEN-0-500" block />,
        <TextArea name="description" label={formatMessage({ id: 'CompanyDescription' })} rule="LEN-0-5000" block />
      ]}
    />
  );
}));

export default FormInner;
