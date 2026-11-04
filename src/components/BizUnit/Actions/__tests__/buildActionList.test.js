jest.mock('../Edit', () => ({ __esModule: true, default: () => null }));
jest.mock('../SetStatus', () => ({ __esModule: true, default: () => null }));
jest.mock('../Remove', () => ({ __esModule: true, default: () => null }));

import buildActionList from '../buildActionList';

const formatMessage = ({ id }) => id;

const baseProps = {
  formatMessage,
  apis: { save: {}, setStatus: {}, remove: {} },
  options: {},
  data: { id: 1, status: 'open' }
};

describe('BizUnit Actions/buildActionList', () => {
  test('返回数组，而不是 { children } 之类的渲染结果', () => {
    // 回归：table-view 的 options 渲染器只接受动作数组，
    // 早先这里被替换成 { children: <Actions/> }，导致操作列整列空白
    const list = buildActionList(baseProps);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    list.forEach(item => expect(item).not.toHaveProperty('children.props'));
  });

  test('按已配置的 apis 生成编辑 / 状态 / 删除动作', () => {
    const list = buildActionList(baseProps);
    expect(list.map(item => item.name)).toEqual(['save', 'setStatusOpen', 'setStatusClose', 'remove']);
  });

  test('状态动作按当前 status 互斥隐藏', () => {
    const list = buildActionList(baseProps);
    const open = list.find(item => item.name === 'setStatusOpen');
    const close = list.find(item => item.name === 'setStatusClose');
    expect(open.hidden).toBe(true);
    expect(close.hidden).toBe(false);
  });

  test('getActionList 的项保持原顺序，同名项合并而不是重复', () => {
    const list = buildActionList({
      ...baseProps,
      apis: { save: {} },
      getActionList: () => [
        { name: 'preview', children: '预览' },
        { name: 'remove', children: '自定义删除' }
      ]
    });

    expect(list.map(item => item.name)).toEqual(['preview', 'remove', 'save']);
    expect(list.find(item => item.name === 'remove').children).toBe('自定义删除');
  });

  test('没有 apis 时不抛错，只返回 getActionList 的结果', () => {
    expect(buildActionList({ ...baseProps, apis: undefined })).toEqual([]);
  });
});
