import { createWithIntlProvider, createIntl } from '@kne/react-intl';
import zhCN from './locale/zh-CN';
import enUS from './locale/en-US';

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
};

const withLocale = createWithIntlProvider({
  defaultLocale: 'zh-CN',
  messages,
  namespace: 'components-admin:MailGateway'
});

export const createFormatMessage = locale => {
  const { formatMessage } = createIntl({
    locale,
    messages,
    namespace: 'components-admin:MailGateway'
  });
  return formatMessage;
};

export default withLocale;
