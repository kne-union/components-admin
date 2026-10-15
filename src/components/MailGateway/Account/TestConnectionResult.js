import { Flex, Typography } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const ResultLine = ({ title, result }) => {
  const { formatMessage } = useIntl();
  return (
    <div>
      <Typography.Text strong>{title}：</Typography.Text>
      {result?.success ? (
        <Typography.Text type="success">{formatMessage({ id: 'ConnectionSuccess' })}</Typography.Text>
      ) : (
        <Typography.Text type="danger">{result?.error || formatMessage({ id: 'ConnectionFailed' })}</Typography.Text>
      )}
    </div>
  );
};

const TestConnectionResult = withLocale(({ result }) => (
  <Flex vertical gap={8}>
    <ResultLine title="IMAP" result={result?.imap} />
    <ResultLine title="SMTP" result={result?.smtp} />
  </Flex>
));

export const showTestResult = ({ modal, formatMessage, result }) => {
  modal[result?.success ? 'success' : 'error']({
    title: formatMessage({ id: result?.success ? 'ConnectionSuccess' : 'ConnectionFailed' }),
    content: <TestConnectionResult result={result} />
  });
};

export default TestConnectionResult;
