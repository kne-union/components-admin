import createGetActionList from '../createGetActionList';

jest.mock('../Edit', () => ({ __esModule: true, default: () => null }));
jest.mock('../SetStatus', () => ({ __esModule: true, default: () => null }));
jest.mock('../Invite', () => ({ __esModule: true, default: () => null }));
jest.mock('../Remove', () => ({ __esModule: true, default: () => null }));
jest.mock('../BindThirdLogin', () => ({ __esModule: true, default: () => null }));


const formatMessage = ({ id }) => id;

const fullApis = {
  save: { url: '/save', method: 'POST' },
  inviteToken: { url: '/invite-token', method: 'GET' }
};

// BizUnit 调用 getActionList(props) 时，props 里的 apis 只有自己的 { list }
const bizUnitProps = { apis: { list: { url: '/list', method: 'GET' } }, options: {} };

describe('Tenant UserList createGetActionList', () => {
  test('BizUnit 传入的 apis 不能覆盖完整的写接口（回归：1.1.149 起编辑 / 邀请丢失）', () => {
    const getActionList = createGetActionList({ formatMessage, apis: fullApis });
    const list = getActionList({ ...bizUnitProps, data: { id: 1, userId: null } });
    const edit = list.find(item => item.children === 'EditUser');
    const invite = list.find(item => item.children === 'InviteUser');
    expect(edit.hidden).toBeFalsy();
    expect(invite.hidden).toBeFalsy();
    expect(invite.apis).toBe(fullApis);
  });

  test('getActions 可以扩展或替换动作列表', () => {
    const extra = { children: 'Extra' };
    const getActionList = createGetActionList({ formatMessage, apis: fullApis, getActions: ({ list }) => [...list, extra] });
    const list = getActionList({ ...bizUnitProps, data: { id: 1, userId: null } });
    expect(list[list.length - 1]).toBe(extra);
  });
});
