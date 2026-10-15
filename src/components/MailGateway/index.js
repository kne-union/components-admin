import AppChildrenRouter from '@kne/app-children-router';
import Mailbox from './Mailbox';
import Account from './Account';
import Label from './Label';
import Rule from './Rule';
import RuleLog from './RuleLog';
import Template from './Template';
import TemplateCategory from './Template/Category';
import Contact from './Contact';
import { ContactsProvider } from './fields';
import { PageRenderProvider } from './PageLayout';

const MailGateway = ({ baseUrl, children, getContacts, renderPage = null, ...props }) => {
  return (
    <ContactsProvider getContacts={getContacts}>
      <PageRenderProvider value={renderPage}>
        <AppChildrenRouter
        list={[
          {
            index: true,
            element: <Mailbox {...props} baseUrl={baseUrl} />
          },
          {
            path: 'accounts',
            element: <Account {...props} baseUrl={baseUrl} />
          },
          {
            path: 'labels',
            element: <Label {...props} baseUrl={baseUrl} />
          },
          {
            path: 'templates',
            element: <Template {...props} baseUrl={baseUrl} />
          },
          {
            path: 'template-categories',
            element: <TemplateCategory {...props} baseUrl={baseUrl} />
          },
          {
            path: 'rules',
            element: <Rule {...props} baseUrl={baseUrl} />
          },
          {
            path: 'rule-logs',
            element: <RuleLog {...props} baseUrl={baseUrl} />
          },
          {
            path: 'contacts',
            element: <Contact {...props} baseUrl={baseUrl} />
          }
        ]}
      >
        {children}
        </AppChildrenRouter>
      </PageRenderProvider>
    </ContactsProvider>
  );
};

export default MailGateway;

export { default as enums } from './enums';
export { default as Menu, getMenuItems } from './Menu';
export { default as Compose } from './Mailbox/Compose';
export { default as MailDetail } from './Mailbox/MailDetail';
export { AddressText, AddressList } from './Contact/AddressText';
export {
  AccountSelect,
  LabelSelect,
  TemplateSelect,
  TemplateCategorySelect,
  AccountSelectField,
  LabelSelectField,
  TemplateSelectField,
  TemplateCategorySelectField,
  ContactsProvider,
  ContactSelect,
  ContactInput,
  ContactSelectField,
  ContactInputField
} from './fields';
export { Mailbox, Account, Label, Rule, RuleLog, Template, TemplateCategory, Contact };
