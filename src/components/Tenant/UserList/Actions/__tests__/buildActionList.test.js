import buildActionList from '../buildActionList';

jest.mock('../Edit', () => ({ __esModule: true, default: () => null }));
jest.mock('../SetStatus', () => ({ __esModule: true, default: () => null }));
jest.mock('../Invite', () => ({ __esModule: true, default: () => null }));
jest.mock('../Remove', () => ({ __esModule: true, default: () => null }));
jest.mock('../BindThirdLogin', () => ({ __esModule: true, default: () => null }));


const formatMessage = ({ id }) => id;

const baseProps = {
  formatMessage,
  apis: { save: {}, inviteToken: { url: '/api/v1/tenant/admin/user-invite-token', method: 'GET' } },
  data: { id: 1, userId: null }
};

describe('Tenant UserList Actions/buildActionList 邀请用户', () => {
  test('有 inviteToken 接口且未绑定账号时显示邀请用户', () => {
    const invite = buildActionList(baseProps).find(item => item.children === 'InviteUser');
    expect(invite.hidden).toBeFalsy();
  });

  test('没有 inviteToken 接口（无权限 / 托管租户）时隐藏邀请用户，避免请求空地址', () => {
    [false, null, undefined].forEach(inviteToken => {
      const list = buildActionList({ ...baseProps, apis: { ...baseProps.apis, inviteToken } });
      const invite = list.find(item => item.children === 'InviteUser');
      expect(invite.hidden).toBeTruthy();
    });
  });

  test('已绑定账号时仍隐藏邀请用户', () => {
    const invite = buildActionList({ ...baseProps, data: { id: 1, userId: 'u1' } }).find(item => item.children === 'InviteUser');
    expect(invite.hidden).toBeTruthy();
  });
});
