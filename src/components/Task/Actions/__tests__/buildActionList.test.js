jest.mock('../CancelTask', () => ({ __esModule: true, default: () => null }));
jest.mock('../RetryTask', () => ({ __esModule: true, default: () => null }));
jest.mock('../ErrorDetail', () => ({ __esModule: true, default: () => null }));
jest.mock('../ResultDetail', () => ({ __esModule: true, default: () => null }));
jest.mock('../InputDetail', () => ({ __esModule: true, default: () => null }));
jest.mock('../ViewLogs', () => ({ __esModule: true, default: () => null }));

import buildActionList from '../buildActionList';

const formatMessage = ({ id }) => id;

const build = (data, extra = {}) => buildActionList({ formatMessage, data, onSuccess: () => {}, ...extra });

describe('Task Actions/buildActionList', () => {
  test('返回数组，而不是 { children: <Actions/> } 这类渲染结果', () => {
    // 回归：table-view 的 options 渲染器只接受动作数组（或 { list }），
    // 早先列配置返回 { children: <Actions/> }，操作列整列空白
    const list = build({ id: 1, status: 'pending', runnerType: 'system' });
    expect(Array.isArray(list)).toBe(true);
    list.forEach(item => expect(item).not.toHaveProperty('children.props'));
  });

  test('pending 展示「查看入参 + 取消」', () => {
    const list = build({ id: 1, status: 'pending', runnerType: 'system' });
    expect(list.map(item => item.children)).toEqual(['ViewInputParams', 'Cancel']);
  });

  test('running 只展示「取消」', () => {
    const list = build({ id: 1, status: 'running', runnerType: 'system' });
    expect(list.map(item => item.children)).toEqual(['Cancel']);
  });

  test('failed 展示「重试 + 错误详情」', () => {
    const list = build({ id: 1, status: 'failed', runnerType: 'system' });
    expect(list.map(item => item.children)).toEqual(['Retry', 'ErrorDetail']);
  });

  test('人工任务且有 getManualTaskAction 时追加「完成」', () => {
    const ManualAction = () => null;
    const list = build({ id: 1, status: 'pending', runnerType: 'manual' }, { getManualTaskAction: () => ManualAction });
    expect(list[0]).toMatchObject({ buttonComponent: ManualAction, children: 'Complete' });
  });

  test('人工任务但 getManualTaskAction 未命中时不追加', () => {
    const list = build({ id: 1, status: 'pending', runnerType: 'manual' }, { getManualTaskAction: () => undefined });
    expect(list.map(item => item.children)).toEqual(['ViewInputParams', 'Cancel']);
  });

  test('有日志时追加「查看日志」', () => {
    const list = build({ id: 1, status: 'success', runnerType: 'system', options: { logs: ['a'] } });
    expect(list.map(item => item.children)).toEqual(['ViewResult', 'ViewLogs']);
  });
});
