const { default: GroupSelect } = _GroupSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;
const { useState } = React;

const FilterExample = createWithRemoteLoader({
  modules: ['components-core:Filter', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [Filter, PureGlobal] = remoteModules;
  const [value, onChange] = useState([]);
  const GroupSelectFilterItem = GroupSelect.FilterItem;
  const GroupFolderFilterItem = GroupSelect.GroupFolderFilterItem;

  return (
    <PureGlobal preset={mockPreset}>
      <Filter
        value={value}
        onChange={next => {
          console.log('筛选值:', Filter.getFilterValue(next));
          onChange(next);
        }}
        list={[
          [
            <GroupSelectFilterItem
              label="技能标签"
              name="groups"
              type="skill"
              groupName="技能标签"
              placeholder="请选择技能标签"
              permissions={[]}
            />,
            <GroupSelectFilterItem
              label="问题标签"
              name="tags"
              type="question_tag"
              groupName="问题标签"
              single
              placeholder="请选择问题标签"
              permissions={[]}
            />,
            <GroupFolderFilterItem label="文件夹" name="folder" type="skill" single placeholder="请选择文件夹" />
          ]
        ]}
      />
    </PureGlobal>
  );
});

render(<FilterExample />);
