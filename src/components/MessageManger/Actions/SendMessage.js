import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import MessageFormInner from '../MessageFormInner';

const SendMessageInner = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:FormInfo@useFormModal']
})(({ remoteModules, data, detailType, onSuccess, ...props }) => {
  const [usePreset, useFormModal] = remoteModules;
  const { apis, ajax } = usePreset();
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  const formModal = useFormModal();
  const navigate = useNavigate();

  const handleSuccess = () => {
    if (detailType === 'template') {
      navigate('./records');
    } else {
      onSuccess && onSuccess();
    }
  };

  return (
    <Button
      {...props}
      onClick={() => {
        formModal({
          title: formatMessage({ id: 'SendMessage' }),
          formProps: {
            data: { props: '{}' },
            onSubmit: async formData => {
              const { data: resData } = await ajax(
                Object.assign({}, apis.messageManger.templates.send, {
                  data: {
                    templateId: data.id,
                    name: formData.name,
                    props: JSON.parse(formData.props)
                  }
                })
              );
              if (resData.code !== 0) {
                return false;
              }
              message.success(formatMessage({ id: 'SendMessageSuccess' }));
              handleSuccess();
            }
          },
          children: <MessageFormInner data={data} />
        });
      }}
    />
  );
});

const SendMessage = withLocale(SendMessageInner);
export default SendMessage;
