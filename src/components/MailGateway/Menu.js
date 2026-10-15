import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import {
  ContactsOutlined,
  FileTextOutlined,
  FolderOutlined,
  HistoryOutlined,
  IdcardOutlined,
  MailOutlined,
  TagsOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import withLocale, { createFormatMessage } from './withLocale';

const MENU_LIST = [
  { key: 'mailbox', path: '/', labelId: 'Mailbox', Icon: MailOutlined },
  { key: 'accounts', path: '/accounts', labelId: 'AccountManage', Icon: IdcardOutlined },
  { key: 'contacts', path: '/contacts', labelId: 'ContactManage', Icon: ContactsOutlined },
  { key: 'labels', path: '/labels', labelId: 'LabelManage', Icon: TagsOutlined },
  { key: 'templates', path: '/templates', labelId: 'TemplateManage', Icon: FileTextOutlined },
  { key: 'templateCategories', path: '/template-categories', labelId: 'TemplateCategoryManage', Icon: FolderOutlined },
  { key: 'rules', path: '/rules', labelId: 'RuleManage', Icon: ThunderboltOutlined },
  { key: 'ruleLogs', path: '/rule-logs', labelId: 'RuleLog', Icon: HistoryOutlined }
];

/**
 * 模块菜单项，path 相对模块根路径（邮箱为 '/'），可直接作为 @kne/system-layout 的 menu.items（menu.base 设为模块 baseUrl）
 */
export const getMenuItems = ({ locale, formatMessage = createFormatMessage(locale || 'zh-CN') } = {}) =>
  MENU_LIST.map(({ key, path, labelId, Icon }) => ({ key, path, icon: <Icon />, label: formatMessage({ id: labelId }) }));

const Menu = createWithRemoteLoader({
  modules: ['components-core:Menu']
})(
  withLocale(({ remoteModules, baseUrl, withMailbox = true }) => {
    const [Menu] = remoteModules;
    const { formatMessage } = useIntl();
    const rootPath = baseUrl || '';
    return (
      <Menu
        items={getMenuItems({ formatMessage })
          .filter(item => withMailbox || item.key !== 'mailbox')
          .map(({ path, ...item }) => Object.assign(item, { path: path === '/' ? rootPath : `${rootPath}${path}` }))}
      />
    );
  })
);

export default Menu;
