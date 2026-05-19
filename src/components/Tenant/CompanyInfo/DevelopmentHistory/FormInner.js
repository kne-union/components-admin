import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';
import style from '../style.module.scss';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(withLocale(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { formatMessage } = useIntl();
  const { List } = FormInfo;
  const { DatePicker, TextArea, Upload } = FormInfo.fields;

  return (
    <List bordered
      className={style['form-section']}
      title={formatMessage({ id: 'DevelopmentHistory' })}
      name="developmentHistory"
      list={[
        <DatePicker name="time" label={formatMessage({ id: 'Time' })} rule="REQ" />,
        <TextArea name="event" label={formatMessage({ id: 'Event' })} rule="REQ LEN-0-500" block />,
        <Upload
          name="images"
          label={formatMessage({ id: 'HistoryImages' })}
          interceptor="photo-string-list"
          block
          getPermission={type => {
            return ['preview', 'delete'].indexOf(type) > -1;
          }}
        />,
        <TextArea name="extra" label={formatMessage({ id: 'HistoryExtra' })} rule="LEN-0-500" block />
      ]}
    />
  );
}));

export default FormInner;
