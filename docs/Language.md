# Language

### 概述

切换系统语言


### 示例

#### 示例样式

```scss
.example-driver-preview {
  background: #999;
}
```

#### 示例代码

- 这里填写示例标题
- 这里填写示例说明
- _Language(@components/Language)

```jsx
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

```

### API

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
