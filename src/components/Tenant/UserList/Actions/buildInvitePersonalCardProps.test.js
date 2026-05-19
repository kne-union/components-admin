jest.mock('antd', () => ({
  Typography: {
    Text: ({ children }) => children
  }
}));

import buildInvitePersonalCardProps from './buildInvitePersonalCardProps';

const formatMessage = ({ id }) => id;
const Image = { Avatar: () => null };

const sampleUser = {
  name: '张三',
  email: 'zhang@example.com',
  phone: '13800000000',
  roles: [{ name: '管理员' }, { name: 'HR' }],
  options: { position: '产品经理' },
  tenantOrg: { name: '研发部', path: '公司/研发部' }
};

describe('buildInvitePersonalCardProps without plugin', () => {
  it('builds role and position moreInfo when plugins is undefined', () => {
    const props = buildInvitePersonalCardProps(sampleUser, {
      Image,
      formatMessage,
      positionList: []
    });

    expect(props.name).toBe('张三');
    expect(props.email).toBe('zhang@example.com');
    const keys = props.moreInfo.map(item => item.key);
    expect(keys).toContain('roles');
    expect(keys).toContain('position');
  });

  it('builds role and position when plugins is empty object', () => {
    const props = buildInvitePersonalCardProps(sampleUser, {
      Image,
      formatMessage,
      plugins: {},
      positionList: []
    });

    const keys = props.moreInfo.map(item => item.key);
    expect(keys).toContain('roles');
    expect(keys).toContain('position');
  });

  it('ignores non-function tenantAdmin.personalCard', () => {
    const props = buildInvitePersonalCardProps(sampleUser, {
      Image,
      formatMessage,
      plugins: { tenantAdmin: { personalCard: 'not-a-function' } },
      positionList: []
    });

    expect(props.moreInfo.some(item => item.key === 'position')).toBe(true);
  });

  it('still appends position after plugin enhancer when plugin omits position', () => {
    const props = buildInvitePersonalCardProps(sampleUser, {
      Image,
      formatMessage,
      plugins: {
        tenantAdmin: {
          personalCard: ({ moreInfo }) => moreInfo.filter(item => item.key !== 'position')
        }
      },
      positionList: []
    });

    expect(props.moreInfo.some(item => item.key === 'position')).toBe(true);
  });

  it('resolves position name from positionList by id', () => {
    const props = buildInvitePersonalCardProps(
      {
        ...sampleUser,
        options: { position: 'pos-1' }
      },
      {
        Image,
        formatMessage,
        positionList: [{ id: 'pos-1', name: '高级产品经理' }]
      }
    );

    const positionItem = props.moreInfo.find(item => item.key === 'position');
    expect(positionItem).toBeDefined();
  });

  it('maps roleDetails to roles via normalize', () => {
    const props = buildInvitePersonalCardProps(
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
