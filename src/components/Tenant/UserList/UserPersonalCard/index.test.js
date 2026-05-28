jest.mock('antd', () => ({
  Typography: {
    Text: ({ children }) => children
  }
}));

import { buildPersonalCardProps } from '../UserPersonalCard';

const formatMessage = ({ id }) => id;
const Image = { Avatar: () => null };

const sampleUser = {
  name: '张三',
  email: 'zhang@example.com',
  phone: '13800000000',
  roles: [{ name: '管理员' }, { name: 'HR' }],
  tenantOrg: { name: '研发部', path: '公司/研发部' }
};

describe('buildPersonalCardProps', () => {
  it('builds role and org moreInfo when plugins is undefined', () => {
    const props = buildPersonalCardProps(sampleUser, {
      Image,
      formatMessage
    });

    expect(props.name).toBe('张三');
    expect(props.email).toBe('zhang@example.com');
    const keys = props.moreInfo.map(item => item.key);
    expect(keys).toContain('roles');
  });

  it('builds role and org when plugins is empty object', () => {
    const props = buildPersonalCardProps(sampleUser, {
      Image,
      formatMessage,
      plugins: {}
    });

    const keys = props.moreInfo.map(item => item.key);
    expect(keys).toContain('roles');
  });

  it('ignores non-function tenantAdmin.personalCard', () => {
    const props = buildPersonalCardProps(sampleUser, {
      Image,
      formatMessage,
      plugins: { tenantAdmin: { personalCard: 'not-a-function' } }
    });

    expect(props.moreInfo.some(item => item.key === 'roles')).toBe(true);
  });

  it('applies plugin personalCard enhancer', () => {
    const props = buildPersonalCardProps(sampleUser, {
      Image,
      formatMessage,
      plugins: {
        tenantAdmin: {
          personalCard: ({ moreInfo }) => [...moreInfo, { key: 'custom', label: 'Custom', content: 'test' }]
        }
      }
    });

    expect(props.moreInfo.some(item => item.key === 'custom')).toBe(true);
    expect(props.moreInfo.some(item => item.key === 'roles')).toBe(true);
  });

  it('maps roleDetails to roles', () => {
    const props = buildPersonalCardProps(
      {
        name: '李四',
        roleDetails: [{ name: '财务' }]
      },
      { Image, formatMessage }
    );

    const rolesItem = props.moreInfo.find(item => item.key === 'roles');
    expect(rolesItem).toBeDefined();
  });
});
