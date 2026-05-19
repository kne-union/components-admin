import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';
import style from '../style.module.scss';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(withLocale(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { formatMessage } = useIntl();
  const { Input, TextArea, Upload, Avatar, DatePicker } = FormInfo.fields;
  const { TableList } = FormInfo;

  return (
    <Flex vertical gap={24} className={style['form-section']}>
      <FormInfo bordered
        title={formatMessage({ id: 'CompanyBasicSection' })}
        list={[
          <Upload
            name="banners"
            label={formatMessage({ id: 'BannerBackground' })}
            interceptor="photo-string-list"
            block
            getPermission={type => {
              return ['preview', 'delete'].indexOf(type) > -1;
            }}
          />,
          <Avatar name="logo" label={formatMessage({ id: 'CompanyLogo' })} interceptor="photo-string" block />,
          <Input name="name" label={formatMessage({ id: 'CompanyName' })} rule="REQ LEN-0-100" />,
          <Input name="fullName" label={formatMessage({ id: 'CompanyFullName' })} rule="LEN-0-100" />,
          <Input name="industry" label={formatMessage({ id: 'CompanyIndustry' })} rule="LEN-0-100" />,
          <Input name="scale" label={formatMessage({ id: 'CompanyScale' })} rule="LEN-0-100" />,
          <Input name="website" label={formatMessage({ id: 'CompanyWebsite' })} rule="LEN-0-500" block />,
          <Input name="address" label={formatMessage({ id: 'CompanyAddress' })} rule="LEN-0-200" block />,
          <Input name="phone" label={formatMessage({ id: 'PhoneTitle' })} rule="LEN-0-50" />,
          <Input name="email" label={formatMessage({ id: 'Email' })} rule="LEN-0-100" />,
          <DatePicker name="foundedDate" label={formatMessage({ id: 'CompanyFounded' })} />,
          <TextArea name="description" label={formatMessage({ id: 'CompanyDescription' })} rule="LEN-0-5000" block />,
          <TableList block
                     name="companyTags"
                     title={formatMessage({ id: 'CompanyTags' })}
                     maxLength={12}
                     list={[<Input name="label" label={formatMessage({ id: 'CompanyTagLabel' })} rule="LEN-0-40" />]}
          />
        ]}
      />
    </Flex>
  );
}));

export default FormInner;
