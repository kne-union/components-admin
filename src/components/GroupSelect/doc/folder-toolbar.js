const { default: GroupSelect, GroupFolderToolbar } = _GroupSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;
const { useState } = React;
const { App } = antd;

const flatGroupApis = {
  ...mockPreset.apis.group,
  groupList: {
    loader: () => [
      { id: 1, code: 'frontend', name: '前端开发', description: '前端相关技能' },
      { id: 2, code: 'backend', name: '后端开发', description: '后端相关技能' },
      { id: 3, code: 'ai', name: '人工智能', description: 'AI 相关技能' }
    ]
  }
};

const ToolbarExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const [withParent, setWithParent] = useState(null);
  const [withoutParent, setWithoutParent] = useState(null);
  const Toolbar = GroupFolderToolbar || GroupSelect.GroupFolderToolbar;

  return (
    <PureGlobal preset={mockPreset}>
      <App>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: '#666', fontWeight: 500 }}>有父级（showParent 默认 true）+ 颜色（showColor）</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Toolbar
                type="skill"
                groupName="分组"
                showColor
                apis={mockPreset.apis.group}
                value={withParent}
                onChange={key => setWithParent(key)}
              />
            </div>
            <div style={{ color: '#999', fontSize: 13 }}>
              树形数据，新建/编辑表单含「父级」「颜色」字段；当前：{withParent ? String(withParent) : '全部'}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: '#666', fontWeight: 500 }}>无父级（showParent=false）</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Toolbar
                type="skill"
                groupName="分组"
                showParent={false}
                apis={flatGroupApis}
                value={withoutParent}
                onChange={key => setWithoutParent(key)}
              />
            </div>
            <div style={{ color: '#999', fontSize: 13 }}>
              扁平数据，新建/编辑表单不展示「父级」字段；当前：{withoutParent ? String(withoutParent) : '全部'}
            </div>
          </div>
        </div>
      </App>
    </PureGlobal>
  );
});

render(<ToolbarExample />);
