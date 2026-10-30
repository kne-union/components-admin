import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import TemplatePreview from '../TemplatePreview';

export const openTemplatePreview = ({ modal, formatMessage, template }) => {
  if (!template) {
    return;
  }
  modal({
    title: `${formatMessage({ id: 'TemplatePreview' })} - ${template.name || template.code}`,
    size: 'large',
    bodyScroll: false,
    footer: null,
    children: <TemplatePreview template={template} />
  });
};

const Preview = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal']
})(
  withLocale(({ remoteModules, data, apis, onSuccess, options, getFormInner, fetchOptions, detailType, ...props }) => {
    const [useModal] = remoteModules;
    const modal = useModal();
    const { formatMessage } = useIntl();
    return <Button {...props} onClick={() => openTemplatePreview({ modal, formatMessage, template: data })} />;
  })
);

export default Preview;
