const { default: Language } = _Language;
const BaseExample = () => {
  return (
    <>
      <Language list={[
        { label: '中文', value: 'zh-CN' },
        { label: 'EN', value: 'en-US' },
        { label: '繁体中文', value: 'zh-TW' },
        { label: '日本語', value: 'ja-JP' }
      ]}/>
      <Language
        colorful={false}
        list={[
          { label: '中文', value: 'zh-CN' },
          { label: 'EN', value: 'en-US' },
          { label: '繁体中文', value: 'zh-TW' },
          { label: '日本語', value: 'ja-JP' }
        ]}
      />
    </>
  );
};

render(<BaseExample />);
