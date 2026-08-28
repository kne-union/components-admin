# LoginIllustration

### 概述

用来实现精美的登录插图，含 Lottie 动画与随 locale 切换的 workforce 人才能力主题插图。


### 示例

#### 示例代码

- 默认插图
- Lottie 动画插图
- _LoginIllustration(@components/LoginIllustration)

```jsx
const { default: LoginIllustration } = _LoginIllustration;
const BaseExample = () => {
  return (
    <div style={{ width: '400px', height: '500px' }}>
      <LoginIllustration />
    </div>
  );
};

render(<BaseExample />);

```

- 人才能力插图
- 随 locale 自动切换中英文的 workforce 插图
- _LoginIllustration(@components/LoginIllustration)

```jsx
const { default: LoginIllustration } = _LoginIllustration;
const WorkforceExample = () => {
  return (
    <div style={{ width: '500px', height: '700px' }}>
      <LoginIllustration type="workforce" />
    </div>
  );
};

render(<WorkforceExample />);

```

### API

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|type|插图类型，可选 `hello`、`workforce`|`string`|`hello`|
|className|自定义类名|`string`|-|

`workforce` 会根据全局 `locale`（`zh-CN` / `en-US`）自动切换中英文文案，与登录页语言切换组件联动。
