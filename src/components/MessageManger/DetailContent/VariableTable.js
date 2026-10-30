import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button, Empty, Flex, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import JsonView from '@kne/json-view';
import '@kne/json-view/dist/index.css';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const renderValue = value => {
  if (value === undefined || value === null || value === '') {
    return <Typography.Text type="secondary">-</Typography.Text>;
  }
  if (typeof value === 'object') {
    return <JsonView data={value} collapsedFrom={1} theme="light" />;
  }
  return String(value);
};

/**
 * 变量表：模板变量（name / label / example）或发送记录的变量值（props）
 * props 模式可复制参数 JSON，粘贴到发送消息的 JSON 模式中复用
 */
const VariableTable = createWithRemoteLoader({
  modules: ['components-core:Table']
})(
  withLocale(({ remoteModules, variables, props }) => {
    const [Table] = remoteModules;
    const { formatMessage } = useIntl();
    const { message } = App.useApp();
    const isProps = !variables;
    const dataSource = isProps
      ? Object.entries(props || {}).map(([name, value]) => ({ name, value }))
      : (variables || []).map(item => ({ name: item.name, label: item.label, value: item.example }));

    const columns = [
      {
        name: 'name',
        title: formatMessage({ id: 'VariableName' }),
        width: 200,
        getValueOf: item => (
          <Typography.Text code copyable={{ text: `{{ ${item.name} }}` }}>
            {item.name}
          </Typography.Text>
        )
      },
      isProps ? null : { name: 'label', title: formatMessage({ id: 'VariableLabel' }), width: 200, getValueOf: item => renderValue(item.label) },
      {
        name: 'value',
        title: formatMessage({ id: isProps ? 'VariableValue' : 'VariableExample' }),
        width: 360,
        getValueOf: item => renderValue(item.value)
      }
    ].filter(Boolean);

    const table = (
      <Table
        rowKey="name"
        controllerOpen={false}
        columns={columns}
        dataSource={dataSource}
        empty={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'NoData' })} />}
      />
    );

    if (!isProps || dataSource.length === 0) {
      return table;
    }

    return (
      <Flex vertical gap={8}>
        <Flex justify="space-between" align="center" gap={8} wrap>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {formatMessage({ id: 'CopyPropsTips' })}
          </Typography.Text>
          <Button
            size="small"
            icon={<CopyOutlined />}
            onClick={async () => {
              await navigator.clipboard.writeText(JSON.stringify(props, null, 2));
              message.success(formatMessage({ id: 'CopyPropsSuccess' }));
            }}
          >
            {formatMessage({ id: 'CopyProps' })}
          </Button>
        </Flex>
        {table}
      </Flex>
    );
  })
);

export default VariableTable;
