import getPreviewSize from './getPreviewSize';

describe('getPreviewSize', () => {
  test('普通邮件与容器同宽，高度取正文高度', () => {
    expect(getPreviewSize({ containerWidth: 600, contentWidth: 0, bodyHeight: 144, scrollbarHeight: 0 })).toEqual({ width: 600, height: 144 });
  });

  test('存在宽元素时 iframe 撑到内容宽度，交给容器横向滚动', () => {
    expect(getPreviewSize({ containerWidth: 600, contentWidth: 1224, bodyHeight: 144, scrollbarHeight: 0 })).toEqual({ width: 1224, height: 144 });
  });

  test('容器变窄后仍按缓存的内容宽度撑开，变宽则跟随容器', () => {
    expect(getPreviewSize({ containerWidth: 400, contentWidth: 1224, bodyHeight: 144 })).toEqual({ width: 1224, height: 144 });
    expect(getPreviewSize({ containerWidth: 1400, contentWidth: 1224, bodyHeight: 144 })).toEqual({ width: 1400, height: 144 });
  });

  test('横向滚动条占用高度时补足 iframe 高度', () => {
    expect(getPreviewSize({ containerWidth: 600, bodyHeight: 144, scrollbarHeight: 15 })).toEqual({ width: 600, height: 159 });
  });

  test('缺省参数与极矮内容有兜底，不产生 NaN 或 0 尺寸', () => {
    expect(getPreviewSize({})).toEqual({ width: 1, height: 60 });
    expect(getPreviewSize({ containerWidth: 600, bodyHeight: -10, scrollbarHeight: -5 })).toEqual({ width: 600, height: 60 });
  });
});
