import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import { Flex } from 'antd';
import BizUnit from '@components/BizUnit';
import withLocale from '../withLocale';
import { useBizUnitPage } from '../PageLayout';
import ContactFormInner, { toContactPayload } from './FormInner';
import { createCardRenders, formatDateTime } from '../CardList';
import ContactAvatar from './ContactAvatar';

const Contact = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [usePreset] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const contactApis = apis.mailGateway.contact;

    return (
      <BizUnit
        isNext
        name="mail-gateway-contact"
        {...useBizUnitPage({ title: formatMessage({ id: 'ContactManage' }), baseUrl, pageProps })}
        apis={{
          list: Object.assign({}, contactApis.list, { params: { filter: {} } }),
          create: ({ formData }) => Object.assign({}, contactApis.create, { data: toContactPayload(formData) }),
          save: ({ formData, data }) => Object.assign({}, contactApis.save, { urlParams: { id: data.id }, data: toContactPayload(formData) }),
          remove: ({ data }) => Object.assign({}, contactApis.remove, { urlParams: { id: data.id } })
        }}
        getColumns={() => [
          {
            name: 'name',
            title: formatMessage({ id: 'ContactName' }),
            width: 200,
            getValueOf: item => item.name || '-',
            render: (value, { dataSource }) => (
              <Flex align="center" gap={8}>
                <ContactAvatar contact={dataSource} size={28} />
                <span>{value}</span>
              </Flex>
            )
          },
          { name: 'address', title: formatMessage({ id: 'ContactAddress' }), width: 280 },
          { name: 'remark', title: formatMessage({ id: 'Remark' }), min: 240, ellipsis: true },
          { name: 'createdAt', title: formatMessage({ id: 'CreatedAt' }), width: 180, format: 'datetime' }
        ]}
        getFormInner={() => <ContactFormInner />}
        options={{
          bizName: formatMessage({ id: 'Contact' }),
          keywordFilterLabel: formatMessage({ id: 'ContactSearchPlaceholder' }),
          saveData: data => ({ name: data.name, address: data.address, avatar: data.avatar, remark: data.remark }),
          removeMessage: formatMessage({ id: 'ConfirmRemoveContact' }),
          tableProps: createCardRenders(item => ({
            leading: <ContactAvatar contact={item} size={40} />,
            title: item.name || item.address,
            subtitle: item.name ? item.address : null,
            description: item.remark,
            footer: item.createdAt && `${formatMessage({ id: 'CreatedAt' })} ${formatDateTime(item.createdAt)}`
          }))
        }}
      />
    );
  })
);

export default Contact;
