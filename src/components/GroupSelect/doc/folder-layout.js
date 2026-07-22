const { default: GroupSelect, GroupFolder } = _GroupSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;
const { useState } = React;
const { App, Card, Empty } = antd;

const FolderExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const [selected, setSelected] = useState(null);
  const Folder = GroupFolder || GroupSelect.GroupFolder;

  return (
    <PureGlobal preset={mockPreset}>
      <App>
        <Folder
          type="skill"
          apis={mockPreset.apis.group}
          value={selected}
          onChange={(key, item) => {
            setSelected(key);
            console.log('选中分组:', key, item);
          }}
          style={{ minHeight: 280 }}
        >
          <Card size="small" title={selected ? `当前分组：${selected}` : '全部内容'}>
            <Empty description="这里放列表或详情内容，随左侧分组切换" />
          </Card>
        </Folder>
      </App>
    </PureGlobal>
  );
});

render(<FolderExample />);
