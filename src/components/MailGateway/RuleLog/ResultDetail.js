import { useState } from 'react';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { Alert, App, Button, Flex, Tag, Typography } from 'antd';
import { useIntl } from '@kne/react-intl';
import dayjs from 'dayjs';
import JsonView from '@kne/json-view';
import '@kne/json-view/dist/index.css';
import withLocale from '../withLocale';
import enums from '../enums';
import style from '../style.module.scss';

const LOG_STATUS_COLOR = { success: 'success', partial: 'warning', failed: 'error' };

const hasOutput = output => output && typeof output === 'object' && Object.keys(output).length > 0;

export const ResultItem = ({ item, index, actionMap, formatMessage }) => (
  <div className={style['log-result-item']}>
    <div className={style['log-result-head']}>
      <span className={style['rule-step']}>{index + 1}</span>
      <Typography.Text strong>{actionMap.get(item.type)?.label || item.type}</Typography.Text>
      <Tag color={item.success ? 'success' : 'error'} className={style['log-result-status']}>
        {formatMessage({ id: item.success ? 'LogSuccess' : 'LogFailed' })}
      </Tag>
    </div>
    <Flex vertical gap={8} className={style['log-result-body']}>
      {item.error && <Alert type="error" showIcon message={item.error} />}
      {(item.logs || []).length > 0 && (
        <div className={style['log-result-logs']}>
          {item.logs.map((line, lineIndex) => (
            <div key={lineIndex}>{line}</div>
          ))}
        </div>
      )}
      {hasOutput(item.output) ? (
        <div className={style['log-result-json']}>
          <JsonView data={item.output} collapsedFrom={2} theme="light" />
        </div>
      ) : (
        !item.error && <Typography.Text type="secondary">{formatMessage({ id: 'NoOutput' })}</Typography.Text>
      )}
    </Flex>
  </div>
);

const canReexecute = log => (log.status === 'failed' || log.status === 'partial') && log.direction !== 'beforeSend';

// 发信前规则拦截或出错时邮件未入库，日志没有关联邮件
export const getLogSubject = (log, formatMessage) => log.mail?.subject || formatMessage({ id: log.mail || log.mailId ? 'NoSubject' : 'MailNotSent' });

const LogDetailContent = withLocale(
  createWithRemoteLoader({
    modules: ['components-core:Global@usePreset']
  })(({ remoteModules, data, actionMap, ruleName, onSuccess }) => {
  const [usePreset] = remoteModules;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  const { formatMessage, locale } = useIntl();
  const [current, setCurrent] = useState(data);
  const [loading, setLoading] = useState(false);
  const status = enums.mailRuleLogStatus({ locale }).find(item => item.value === current.status);
  const reexecute = async () => {
    const ruleId = current.ruleId || current.rule?.id;
    const mailId = current.mailId || current.mail?.id;
    if (!ruleId || !mailId) {
      return;
    }
    setLoading(true);
    try {
      const { data: resData } = await ajax(Object.assign({}, apis.mailGateway.rule.execute, { urlParams: { id: ruleId }, data: { mailId } }));
      if (resData.code !== 0) {
        return;
      }
      if (!resData.data?.executed) {
        message.warning(formatMessage({ id: 'ExecuteRuleNotMatched' }));
        return;
      }
      const execution = resData.data.execution || {};
      setCurrent(prev =>
        Object.assign({}, prev, {
          status: execution.status,
          results: execution.results || []
        })
      );
      const failed = (execution.results || []).find(item => !item.success);
      if (failed) {
        message.error(failed.error || formatMessage({ id: 'LogFailed' }));
      } else {
        message.success(formatMessage({ id: 'OperationSuccess' }));
      }
      onSuccess && onSuccess();
    } finally {
      setLoading(false);
    }
  };
  return (
    <Flex vertical gap={16}>
      <div className={style['log-result-summary']}>
        <Flex justify="space-between" align="center" gap={12}>
          <div>
            <span className={style['log-result-label']}>{formatMessage({ id: 'RuleName' })}</span>
            <Typography.Text strong>{ruleName}</Typography.Text>
          </div>
          {canReexecute(current) && (
            <Button type="primary" loading={loading} onClick={reexecute}>
              {formatMessage({ id: 'Reexecute' })}
            </Button>
          )}
        </Flex>
        <div>
          <span className={style['log-result-label']}>{formatMessage({ id: 'Subject' })}</span>
          <Typography.Text>{getLogSubject(current, formatMessage)}</Typography.Text>
        </div>
        <Flex wrap gap={24}>
          <div>
            <span className={style['log-result-label']}>{formatMessage({ id: 'Status' })}</span>
            <Tag color={LOG_STATUS_COLOR[current.status]}>{status?.description || current.status}</Tag>
          </div>
          <div>
            <span className={style['log-result-label']}>{formatMessage({ id: 'ExecutionTime' })}</span>
            <Typography.Text>{current.executionTime != null ? `${current.executionTime} ms` : '-'}</Typography.Text>
          </div>
          <div>
            <span className={style['log-result-label']}>{formatMessage({ id: 'ExecutedAt' })}</span>
            <Typography.Text>{current.createdAt ? dayjs(current.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</Typography.Text>
          </div>
        </Flex>
      </div>
      {(current.results || []).map((item, index) => (
        <ResultItem key={`${current.status}-${index}`} item={item} index={index} actionMap={actionMap} formatMessage={formatMessage} />
      ))}
    </Flex>
  );
})
);

const ResultDetail = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal']
})(
  withLocale(({ remoteModules, data, actionMap, ruleName, onSuccess, children, ...props }) => {
    const [useModal] = remoteModules;
    const modal = useModal();
    const { formatMessage } = useIntl();
    return (
      <Button
        {...props}
        onClick={() => {
          modal({
            title: formatMessage({ id: 'ActionResults' }),
            footerButtons: [{ type: 'primary', children: formatMessage({ id: 'Close' }) }],
            children: <LogDetailContent data={data} actionMap={actionMap} ruleName={ruleName} onSuccess={onSuccess} />
          });
        }}
      >
        {children}
      </Button>
    );
  })
);

export default ResultDetail;
