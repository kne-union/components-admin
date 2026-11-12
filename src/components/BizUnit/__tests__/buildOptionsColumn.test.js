import buildOptionsColumn from '../buildOptionsColumn';

// jest.mock 由 babel-jest 自动提升到 import 之前，无需写在文件顶部
jest.mock('../Actions/buildActionList', () => ({ __esModule: true, default: () => [{ name: 'save', children: '编辑' }] }));

const formatMessage = ({ id }) => id;
const baseProps = { formatMessage, apis: {}, options: {} };

describe('BizUnit/buildOptionsColumn', () => {
  test('默认只展示三点「更多」：showLength 固定为 0', () => {
    // 回归：不传 showLength 时 ButtonGroup 走自动测量，48px 列宽下
    // 测量前先外显 1 个按钮，把「更多」图标挤出 overflow:hidden 被裁掉
    const column = buildOptionsColumn(baseProps);
    expect(column.renderType).toBe('options');
    expect(column.getValueOf({}, {}).showLength).toBe(0);
  });

  test('业务显式配置 showLength 时按配置外显按钮', () => {
    const column = buildOptionsColumn({ ...baseProps, options: { showLength: 2 } });
    expect(column.getValueOf({}, {}).showLength).toBe(2);
  });

  test('optionsColumn 仍可覆盖操作列宽', () => {
    const column = buildOptionsColumn({ ...baseProps, options: { optionsColumn: { width: 160 } } });
    expect(column.width).toBe(160);
  });
});
