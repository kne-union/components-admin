import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';
import style from '../style.module.scss';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(withLocale(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { formatMessage } = useIntl();
  const { TableList } = FormInfo;
  const { DatePicker, Input } = FormInfo.fields;

  return <TableList className={style['form-section']} name="developmentHistory" list={[<DatePicker name="time" label={formatMessage({ id: 'Time' })} rule="REQ" />, <Input name="event" label={formatMessage({ id: 'Event' })} rule="REQ LEN-0-500" />]} />;
}));

export default FormInner;
