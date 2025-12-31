import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import { FileImageOutlined } from '@ant-design/icons';
import withLocale from '../withLocale';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(withLocale(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { formatMessage } = useIntl();
  const { Input, InputNumber, TextArea, ColorPicker, Avatar, DateRangePicker } = FormInfo.fields;
  return (
    <>
      <FormInfo
        column={1}
        list={[
          <Input name="name" label={formatMessage({ id: 'TenantName' })} rule="REQ LEN-0-100" />,
          <InputNumber name="accountCount" label={formatMessage({ id: 'AccountCount' })} defaultValue={10} min={1} precision={0} rule="REQ" />,
          <DateRangePicker name="serviceTime" label={formatMessage({ id: 'ServiceTime' })} rule="REQ" />,
          <Avatar name="logo" label={formatMessage({ id: 'Logo' })} block shape="square" width={162} height={48} rule="REQ" interceptor="photo-string" defaultAvatar={<FileImageOutlined />} />,
          <ColorPicker name="themeColor" label={formatMessage({ id: 'ThemeColor' })} format="hex" rule="REQ" defaultValue="#4183F0" disabledAlpha disabledFormat />,
          <TextArea name="description" label={formatMessage({ id: 'TenantDescription' })} block />
        ]}
      />
    </>
  );
}));

export default FormInner;
