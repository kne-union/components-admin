import { createWithRemoteLoader } from '@kne/remote-loader';
import style from '../style.module.scss';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { TableList } = FormInfo;
  const { DatePicker, Input } = FormInfo.fields;

  return <TableList title="发展历程" className={style['form-section']} name="developmentHistory" list={[<DatePicker name="time" label="时间" rule="REQ" />, <Input name="event" label="事件" rule="REQ LEN-0-500" />]} />;
});

export default FormInner;
