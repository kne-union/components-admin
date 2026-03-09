# Task

### 概述

任务管理组件，用于展示和管理系统中的异步任务。支持查看我的任务和全部任务，提供任务筛选、排序、批量操作等功能。包含任务取消、重试、查看错误详情和结果详情等操作。


### 示例(全屏)

#### 示例代码

- 基础用法
- Task 组件的基础使用方式，展示我的任务列表，包含任务筛选、排序和操作功能
- _Task(@components/Task),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom),antd(antd)

```jsx
const { default: Task } = _Task;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { useNavigate, Navigate } = reactRouterDom;
const { Button, Flex } = antd;
const { Route, Routes } = reactRouterDom;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  const navigate = useNavigate();
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route
            path="/Task/task/*"
            element={
              <Task
                baseUrl="/Task"
                pageProps={{
                  menuFixed: false
                }}>
                <Flex gap={8}>
                  <Button
                    onClick={() => {
                      navigate('/Task/task');
                    }}>
                    我的任务
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/Task/task/all');
                    }}>
                    全部任务
                  </Button>
                </Flex>
              </Task>
            }
          />
          <Route path="/Task/*" element={<Navigate to="/Task/task" replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 我的任务
- 展示我的任务列表，支持自定义手动任务的操作按钮，只显示手动执行的任务
- _Task(@components/Task),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom),antd(antd)

```jsx
const { MyTask } = _Task;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { BrowserRouter } = reactRouterDom;
const { Button } = antd;

const MyTaskExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;

  // 自定义手动任务的操作按钮
  const getManualTaskAction = data => {
    return props => (
      <Button
        {...props}
        onClick={() => {
          console.log('完成任务:', data);
          props.onSuccess?.();
        }}>
        完成任务
      </Button>
    );
  };

  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <MyTask
          baseUrl="/Task"
          getManualTaskAction={getManualTaskAction}
          pageProps={{
            menuOpen:false,
            menuFixed: false
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<MyTaskExample />);

```

- 全部任务
- 展示全部任务列表，包含手动执行和自动执行的任务，支持批量重试失败的任务
- _Task(@components/Task),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom)

```jsx
const { AllTask } = _Task;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { BrowserRouter, Routes, Route } = reactRouterDom;

const AllTaskExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;

  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <AllTask
          baseUrl="/Task"
          pageProps={{
            menuOpen: false,
            menuFixed: false
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<AllTaskExample />);

```

- 任务操作按钮
- Actions 组件根据任务状态自动显示相应的操作按钮，如取消、重试、查看错误详情、查看结果等
- _Task(@components/Task),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { Actions } = _Task;
const { default: mockPreset, taskList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Space, Button } = antd;

const ActionsExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const { useState } = React;
  const [refreshKey, setRefreshKey] = useState(0);

  // 获取不同状态的任务数据
  const pendingTask = taskList.data.pageData.find(task => task.status === 'pending');
  const runningTask = taskList.data.pageData.find(task => task.status === 'running');
  const failedTask = taskList.data.pageData.find(task => task.status === 'failed');
  const successTask = taskList.data.pageData.find(task => task.status === 'success');
  const canceledTask = taskList.data.pageData.find(task => task.status === 'canceled');

  const handleSuccess = () => {
    console.log('操作成功');
    setRefreshKey(prev => prev + 1);
  };

  return (
    <PureGlobal preset={mockPreset}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>等待执行的手动任务（显示完成和取消按钮）：</div>
          <Actions
            data={pendingTask}
            type="primary"
            onSuccess={handleSuccess}
            getManualTaskAction={data => {
              return props => (
                <Button
                  {...props}
                  onClick={() => {
                    console.log('完成任务:', data);
                    props.onSuccess?.();
                  }}>
                  完成
                </Button>
              );
            }}
          />
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>执行中的任务（显示取消按钮）：</div>
          <Actions data={runningTask} type="default" onSuccess={handleSuccess} />
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>失败的任务（显示重试和错误详情按钮）：</div>
          <Actions data={failedTask} type="link" onSuccess={handleSuccess} />
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>成功的任务（显示查看结果按钮）：</div>
          <Actions data={successTask} type="link" onSuccess={handleSuccess} />
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>已取消的任务（显示重试按钮）：</div>
          <Actions data={canceledTask} type="default" onSuccess={handleSuccess} />
        </div>
      </Space>
    </PureGlobal>
  );
});

render(<ActionsExample />);

```

- 取消任务
- 展示取消任务功能，支持取消等待执行和执行中的任务
- _Task(@components/Task),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { Actions } = _Task;
const { default: mockPreset, taskList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Space, Card } = antd;

const CancelTaskExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const { useState } = React;

  // 获取可以取消的任务
  const pendingTask = taskList.data.pageData.find(task => task.status === 'pending');
  const runningTask = taskList.data.pageData.find(task => task.status === 'running');

  const handleSuccess = () => {
    console.log('任务已取消');
  };

  return (
    <PureGlobal preset={mockPreset}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card title="等待执行的任务" size="small">
          <div style={{ marginBottom: 8 }}>
            任务名称：{pendingTask.input.name}
          </div>
          <div style={{ marginBottom: 8 }}>
            任务状态：{pendingTask.status}
          </div>
          <Actions data={pendingTask} type="primary" onSuccess={handleSuccess} />
        </Card>

        <Card title="执行中的任务" size="small">
          <div style={{ marginBottom: 8 }}>
            任务名称：{runningTask.input.name}
          </div>
          <div style={{ marginBottom: 8 }}>
            任务状态：{runningTask.status}
          </div>
          <Actions data={runningTask} type="primary" onSuccess={handleSuccess} />
        </Card>
      </Space>
    </PureGlobal>
  );
});

render(<CancelTaskExample />);

```

- 重试任务
- 展示重试任务功能，支持重试失败和已取消的任务
- _Task(@components/Task),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { Actions } = _Task;
const { default: mockPreset, taskList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Space, Card } = antd;

const RetryTaskExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;

  // 获取可以重试的任务
  const failedTask = taskList.data.pageData.find(task => task.status === 'failed');
  const canceledTask = taskList.data.pageData.find(task => task.status === 'canceled');

  const handleSuccess = () => {
    console.log('任务已重新提交执行');
  };

  return (
    <PureGlobal preset={mockPreset}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card title="失败的任务" size="small">
          <div style={{ marginBottom: 8 }}>
            任务名称：{failedTask.input.name}
          </div>
          <div style={{ marginBottom: 8 }}>
            任务状态：{failedTask.status}
          </div>
          <div style={{ marginBottom: 8, color: '#ff4d4f' }}>
            错误信息：{failedTask.error.message}
          </div>
          <Actions data={failedTask} type="primary" onSuccess={handleSuccess} />
        </Card>

        <Card title="已取消的任务" size="small">
          <div style={{ marginBottom: 8 }}>
            任务名称：{canceledTask.input.name}
          </div>
          <div style={{ marginBottom: 8 }}>
            任务状态：{canceledTask.status}
          </div>
          <Actions data={canceledTask} type="primary" onSuccess={handleSuccess} />
        </Card>
      </Space>
    </PureGlobal>
  );
});

render(<RetryTaskExample />);

```

- 错误详情
- 展示失败任务的错误详情，包括输入参数和错误信息
- _Task(@components/Task),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { Actions } = _Task;
const { default: mockPreset, taskList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card } = antd;

const ErrorDetailExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;

  // 获取失败的任务
  const failedTask = taskList.data.pageData.find(task => task.status === 'failed');

  return (
    <PureGlobal preset={mockPreset}>
      <Card title="失败任务详情" size="small">
        <div style={{ marginBottom: 8 }}>
          <strong>任务ID：</strong>{failedTask.id}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>任务名称：</strong>{failedTask.input.name}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>任务类型：</strong>{failedTask.type}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>任务状态：</strong>
          <span style={{ color: '#ff4d4f' }}>{failedTask.status}</span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>错误代码：</strong>{failedTask.error.code}
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>错误信息：</strong>{failedTask.error.message}
        </div>
        <Actions data={failedTask} type="primary" />
      </Card>
    </PureGlobal>
  );
});

render(<ErrorDetailExample />);

```

- 结果详情
- 展示成功任务的结果详情，包括输入参数和输出结果
- _Task(@components/Task),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { Actions } = _Task;
const { default: mockPreset, taskList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card } = antd;

const ResultDetailExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;

  // 获取成功的任务
  const successTask = taskList.data.pageData.find(task => task.status === 'success');

  return (
    <PureGlobal preset={mockPreset}>
      <Card title="成功任务详情" size="small">
        <div style={{ marginBottom: 8 }}>
          <strong>任务ID：</strong>{successTask.id}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>任务名称：</strong>{successTask.input.name}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>任务类型：</strong>{successTask.type}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>任务状态：</strong>
          <span style={{ color: '#52c41a' }}>{successTask.status}</span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>创建时间：</strong>{successTask.createdAt}
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>完成时间：</strong>{successTask.completedAt}
        </div>
        <Actions data={successTask} type="primary" />
      </Card>
    </PureGlobal>
  );
});

render(<ResultDetailExample />);

```

- 表格列配置
- 使用 getColumns 函数获取任务列表的表格列配置，支持自定义国际化
- _Task(@components/Task),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { getColumns } = _Task;
const { default: mockPreset, taskList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const GetColumnsExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout@TablePage', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, TablePage, Layout] = remoteModules;

  // 模拟国际化函数
  const formatMessage = ({ id }) => {
    const messages = {
      ID: 'ID',
      Type: '类型',
      Status: '状态',
      TargetName: '目标名称',
      ExecutionMode: '执行方式',
      CreatedAt: '创建时间',
      CompletedAt: '完成时间',
      UpdatedAt: '更新时间',
      ManualExecution: '手动执行',
      AutomaticExecution: '自动执行'
    };
    return messages[id] || id;
  };

  const columns = getColumns({ formatMessage });

  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <TablePage
          loader={() => {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(taskList.data);
              }, 500);
            });
          }}
          columns={columns}
          pagination={{ paramsType: 'params' }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<GetColumnsExample />);

```

- 枚举值
- 展示 Task 组件提供的枚举值，包括任务状态枚举
- _Task(@components/Task),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { enums } = _Task;
const { Space, Tag } = antd;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const EnumsExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Enum']
})(({ remoteModules }) => {
  const [PureGlobal, Enum] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <h4>任务状态枚举（taskStatus）</h4>
          <Space wrap>
            <Enum moduleName="taskStatus">
              {taskStatusList => {
                return taskStatusList.map(status => (
                  <Tag
                    key={status.value}
                    color={
                      status.type === 'success'
                        ? 'green'
                        : status.type === 'danger'
                          ? 'red'
                          : status.type === 'progress'
                            ? 'blue'
                            : status.type === 'info'
                              ? 'default'
                              : 'default'
                    }>
                    {status.value}: {status.description}
                  </Tag>
                ));
              }}
            </Enum>
          </Space>
        </div>
      </Space>
    </PureGlobal>
  );
});

render(<EnumsExample />);

```

### API

## Task 组件

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|baseUrl|基础路由路径，用于菜单导航|string|-|
|getManualTaskAction|手动任务的自定义操作按钮渲染函数，接收任务数据返回按钮组件|(data) => ReactNode|-|

## MyTask 子组件

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|baseUrl|基础路由路径，用于菜单导航|string|-|
|getManualTaskAction|手动任务的自定义操作按钮渲染函数|(data) => ReactNode|-|

## AllTask 子组件

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|baseUrl|基础路由路径，用于菜单导航|string|-|
|getManualTaskAction|手动任务的自定义操作按钮渲染函数|(data) => ReactNode|-|

## Actions 组件

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|data|任务数据对象|object|-|
|getManualTaskAction|手动任务的自定义操作按钮渲染函数|(data) => ReactNode|-|
|onSuccess|操作成功后的回调函数|() => void|-|
|type|按钮类型|'default' \| 'primary' \| 'link'|'default'|
|moreType|更多按钮的类型|'default' \| 'primary' \| 'link'|'link'|
|itemClassName|按钮项的自定义类名|string|-|
|children|自定义渲染函数，接收操作列表|({ list }) => ReactNode|-|

## CancelTask 组件

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|data|任务数据对象|object|-|
|onSuccess|取消成功后的回调函数|() => void|-|

## RetryTask 组件

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|data|单个任务数据对象（单个重试时使用）|object|-|
|taskIds|任务ID数组（批量重试时使用）|number[]|-|
|onSuccess|重试成功后的回调函数|() => void|-|

## ErrorDetail 组件

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|data|任务数据对象，包含input和error字段|object|-|

## ResultDetail 组件

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|data|任务数据对象，包含input和output字段|object|-|

## getColumns 函数

|参数名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|formatMessage|国际化格式化函数|(descriptor) => string|-|

返回值：TablePage 的 columns 配置数组

## enums 枚举

### taskStatus

任务状态枚举，包含以下值：
- pending: 等待执行
- running: 执行中
- waiting: 等待操作
- success: 成功
- failed: 失败
- canceled: 取消
