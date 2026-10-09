import { Alert, Descriptions, Flex, Typography } from 'antd';

// 通过 modal.info 渲染时不在 withLocale 内，文案由调用方的 formatMessage 提供
const SecretResult = ({ formatMessage, clientId, clientSecret }) => (
  <Flex vertical gap={12}>
    <Alert type="warning" showIcon message={formatMessage({ id: 'SecretOnceWarning' })} />
    <Descriptions
      column={1}
      bordered
      size="small"
      items={[
        { key: 'clientId', label: formatMessage({ id: 'ClientId' }), children: <Typography.Text copyable>{clientId}</Typography.Text> },
        { key: 'clientSecret', label: formatMessage({ id: 'ClientSecret' }), children: <Typography.Text copyable code>{clientSecret}</Typography.Text> }
      ]}
    />
  </Flex>
);

export default SecretResult;
