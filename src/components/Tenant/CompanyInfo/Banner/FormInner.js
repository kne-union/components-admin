import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';
import style from '../style.module.scss';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(withLocale(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { formatMessage } = useIntl();
  const { Upload } = FormInfo.fields;
  return (
    <FormInfo
      className={style['form-section']}
      list={[
        <Upload
          name="banners"
          label={formatMessage({ id: 'Banner' })}
          interceptor="photo-string-list"
          block
          getPermission={type => {
            return ['preview', 'delete'].indexOf(type) > -1;
          }}
        />
      ]}
    />
  );
}));

export default FormInner;
