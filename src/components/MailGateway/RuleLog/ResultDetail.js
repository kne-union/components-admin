import { createWithRemoteLoader } from '@kne/remote-loader';
import { Alert, Button, Flex, Tag, Typography } from 'antd';
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

const ResultDetail = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal']
})(
  withLocale(({ remoteModules, data, actionMap, ruleName, children, ...props }) => {
    const [useModal] = remoteModules;
    const modal = useModal();
    const { formatMessage, locale } = useIntl();
    const status = enums.mailRuleLogStatus({ locale }).find(item => item.value === data.status);
    return (
      <Button
        {...props}
        onClick={() => {
          modal({
            title: formatMessage({ id: 'ActionResults' }),
            footer: null,
            children: (
              <Flex vertical gap={16}>
                <div className={style['log-result-summary']}>
                  <div>
                    <span className={style['log-result-label']}>{formatMessage({ id: 'RuleName' })}</span>
                    <Typography.Text strong>{ruleName}</Typography.Text>
                  </div>
                  <div>
                    <span className={style['log-result-label']}>{formatMessage({ id: 'Subject' })}</span>
                    <Typography.Text>{data.mail?.subject || formatMessage({ id: 'NoSubject' })}</Typography.Text>
                  </div>
                  <Flex wrap gap={24}>
                    <div>
                      <span className={style['log-result-label']}>{formatMessage({ id: 'Status' })}</span>
                      <Tag color={LOG_STATUS_COLOR[data.status]}>{status?.description || data.status}</Tag>
                    </div>
                    <div>
                      <span className={style['log-result-label']}>{formatMessage({ id: 'ExecutionTime' })}</span>
                      <Typography.Text>{data.executionTime != null ? `${data.executionTime} ms` : '-'}</Typography.Text>
                    </div>
                    <div>
                      <span className={style['log-result-label']}>{formatMessage({ id: 'ExecutedAt' })}</span>
                      <Typography.Text>{data.createdAt ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</Typography.Text>
                    </div>
                  </Flex>
                </div>
                {(data.results || []).map((item, index) => (
                  <ResultItem key={index} item={item} index={index} actionMap={actionMap} formatMessage={formatMessage} />
                ))}
              </Flex>
            )
          });
        }}
      >
        {children}
      </Button>
    );
  })
);

export default ResultDetail;
