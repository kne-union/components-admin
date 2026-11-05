import { getRefreshSyncAccountIds } from './utils';

describe('getRefreshSyncAccountIds', () => {
  const accounts = [{ id: 1, status: 'enabled' }, { id: 2, status: 'disabled' }, { id: 3, status: 'enabled' }, { status: 'enabled' }];

  it('选中单个账号时只同步该账号', () => {
    expect(getRefreshSyncAccountIds({ accountId: 2, accounts })).toEqual([2]);
    expect(getRefreshSyncAccountIds({ accountId: 'acc-1', accounts })).toEqual(['acc-1']);
  });

  it('全部账号时只同步启用邮箱', () => {
    expect(getRefreshSyncAccountIds({ accountId: null, accounts })).toEqual([1, 3]);
  });

  it('账号列表为空或参数缺省时不触发同步', () => {
    expect(getRefreshSyncAccountIds({ accounts: [] })).toEqual([]);
    expect(getRefreshSyncAccountIds()).toEqual([]);
    expect(getRefreshSyncAccountIds({ accounts: null })).toEqual([]);
  });
});
