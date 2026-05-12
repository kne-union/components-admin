import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import MessageFormInner from '../MessageFormInner';

const ResendInner = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:FormInfo@useFormModal']
})(({ remoteModules, data, detailType, onSuccess, ...props }) => {
  const [usePreset, useFormModal] = remoteModules;
  const { apis, ajax } = usePreset();
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  const formModal = useFormModal();

  return (
    <Button
      {...props}
      onClick={() => {
        formModal({
          title: formatMessage({ id: 'Resend' }),
          formProps: {
            data: { name: data.name, props: JSON.stringify(data.props || {}, null, 2) },
            onSubmit: async formData => {
              const { data: resData } = await ajax(
                Object.assign({}, apis.messageManger.templates.send, {
                  data: {
                    templateId: data.templateId,
                    name: formData.name,
                    props: JSON.parse(formData.props)
                  }
                })
              );
              if (resData.code !== 0) {
                return false;
              }
              message.success(formatMessage({ id: 'SendMessageSuccess' }));
              onSuccess && onSuccess();
            }
          },
          children: <MessageFormInner data={data} />
        });
      }}
    />
  );
});

const Resend = withLocale(ResendInner);
export default Resend;
