import { Fragment } from 'react';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button, Flex, Tag, Typography } from 'antd';
import { ArrowRightOutlined, CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, MinusCircleFilled } from '@ant-design/icons';
import classnames from 'classnames';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { formatAddressNames } from '../utils';
import { createConditionMaps, formatConditions } from './getColumns';
import { useConditionExtensions } from './ConditionsField';
import { ResultItem } from '../RuleLog/ResultDetail';
import enums from '../enums';
import style from '../style.module.scss';

const MailSelectField = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, folder, ...props }) => {
    const [FormInfo, usePreset] = remoteModules;
    const { SuperSelect } = FormInfo.fields;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    return (
      <SuperSelect
        allowClear
        isPopup
        maxLength={20}
        placeholder={formatMessage({ id: 'SelectTestMail' })}
        pagination={{ paramsType: 'params' }}
        getSearchProps={({ searchText }) => ({
          filter: Object.assign({ folder }, searchText ? { keyword: searchText } : null)
        })}
        api={Object.assign({}, apis.mailGateway.mail.list, {
          params: { filter: { folder } },
          transformData: data =>
            Object.assign({}, data, {
              pageData: (data.pageData || []).map(item =>
                Object.assign({}, item, {
                  value: item.id,
                  label: `${item.subject || formatMessage({ id: 'NoSubject' })} - ${formatAddressNames(folder === 'sent' ? item.to : item.from)}`
                })
              )
            })
        })}
        interceptor="array-output-value"
        {...props}
      />
    );
  })
);

const getConditionState = item => (item.skipped ? 'skipped' : item.matched ? 'matched' : 'unmatched');

const CONDITION_STATE_ICON = {
  matched: <CheckCircleFilled />,
  unmatched: <CloseCircleFilled />,
  skipped: <MinusCircleFilled />
};

const CONDITION_STATE_TEXT = { matched: 'TestMatched', unmatched: 'TestNotMatched', skipped: 'TestSkipped' };

const ResultBanner = ({ type, icon, title, description }) => (
  <div className={classnames(style['test-banner'], style[`is-${type}`])}>
    <span className={style['test-banner-icon']}>{icon}</span>
    <div className={style['test-banner-text']}>
      <div className={style['test-banner-title']}>{title}</div>
      {description && <div className={style['test-banner-desc']}>{description}</div>}
    </div>
  </div>
);

const ConditionRow = ({ item, maps, formatMessage }) => {
  const state = getConditionState(item);
  return (
    <div className={classnames(style['test-condition'], style[`is-${state}`])}>
      <div className={style['test-condition-main']}>
        <span className={style['test-condition-icon']}>{CONDITION_STATE_ICON[state]}</span>
        <div className={style['test-condition-text']}>
          {item.type ? (
            <span className={style['test-condition-field']}>{maps.conditionMap?.get(item.type)?.label || item.label || item.type}</span>
          ) : (
            <>
              <span className={style['test-condition-field']}>{maps.fieldMap.get(item.field) || item.field}</span>
              <span className={style['test-condition-operator']}>{maps.operatorMap.get(item.operator) || item.operator}</span>
              <span className={style['test-condition-value']}>{item.value}</span>
            </>
          )}
        </div>
        <span className={style['test-condition-state']}>{formatMessage({ id: CONDITION_STATE_TEXT[state] })}</span>
      </div>
      {item.reason && <div className={style['test-condition-note']}>{item.reason}</div>}
      {item.error && (
        <div className={classnames(style['test-condition-note'], style['is-error'])}>
          {formatMessage({ id: 'TestConditionError' }, { error: item.error })}
        </div>
      )}
    </div>
  );
};

const ResultSection = ({ title, extra, children }) => (
  <div className={style['test-section']}>
    <div className={style['test-section-head']}>
      <span className={style['test-section-title']}>{title}</span>
      {extra}
    </div>
    {children}
  </div>
);

const MailTestItem = ({ result, conditions, maps, formatMessage }) => {
  const details = result.details || [];
  return (
    <div className={style['test-mail-item']}>
      <div className={style['test-mail-item-head']}>
        <span className={classnames(style['test-condition-icon'], style[`is-${result.matched ? 'matched' : 'unmatched'}`])}>
          {result.matched ? <CheckCircleFilled /> : <CloseCircleFilled />}
        </span>
        <Typography.Text ellipsis className={style['test-mail-item-subject']}>
          {result.subject || formatMessage({ id: 'NoSubject' })}
        </Typography.Text>
        <span className={style['test-condition-state']}>{formatMessage({ id: result.matched ? 'TestMatched' : 'TestNotMatched' })}</span>
      </div>
      {!result.accountMatched && (
        <Typography.Text type="warning" className={style['test-condition-note']}>
          {formatMessage({ id: 'TestAccountNotMatched' })}
        </Typography.Text>
      )}
      {details.length > 0 && (
        <Flex vertical gap={8} className={style['test-mail-item-conditions']}>
          {details.length > 1 && <Tag bordered={false}>{formatMessage({ id: conditions?.match === 'any' ? 'MatchAny' : 'MatchAll' })}</Tag>}
          {details.map((item, index) => (
            <ConditionRow key={index} item={item} maps={maps} formatMessage={formatMessage} />
          ))}
        </Flex>
      )}
    </div>
  );
};

const TestResult = withLocale(({ payload, conditions, actions, actionMap, conditionMap, direction }) => {
  const { formatMessage, locale } = useIntl();
  const maps = createConditionMaps({ locale, conditionMap });
  const results = payload.results || [];
  const matchedCount = payload.matchedCount || 0;
  const total = payload.total || results.length;
  const willExecute = matchedCount > 0 && actions.length > 0;
  return (
    <Flex vertical gap={20}>
      <ResultBanner
        type={matchedCount > 0 ? 'success' : 'default'}
        icon={matchedCount > 0 ? <CheckCircleFilled /> : <CloseCircleFilled />}
        title={formatMessage({ id: 'TestBatchSummary' }, { matched: matchedCount, total })}
        description={formatMessage({
          id:
            matchedCount > 0
              ? willExecute
                ? direction === 'beforeSend'
                  ? 'TestMatchedBeforeSendDesc'
                  : direction === 'schedule'
                    ? 'TestMatchedScheduleDesc'
                    : 'TestMatchedDesc'
                : 'TestMatchedNoActionDesc'
              : 'TestNotMatchedDesc'
        })}
      />
      <ResultSection title={formatMessage({ id: 'TestMail' })}>
        <Flex vertical gap={12}>
          {results.map(item => (
            <MailTestItem key={item.mailId} result={item} conditions={conditions} maps={maps} formatMessage={formatMessage} />
          ))}
        </Flex>
      </ResultSection>
      {willExecute && (
        <ResultSection title={formatMessage({ id: 'TestWillExecute' })}>
          <div className={style['test-actions']}>
            {actions.map((action, index) => (
              <Fragment key={index}>
                {index > 0 && <ArrowRightOutlined className={style['test-actions-arrow']} />}
                <span className={style['test-action']}>
                  <span className={style['rule-step']}>{index + 1}</span>
                  {actionMap.get(action.type)?.label || action.type}
                </span>
              </Fragment>
            ))}
          </div>
        </ResultSection>
      )}
    </Flex>
  );
});

const EXECUTE_BANNER = {
  success: { type: 'success', icon: <CheckCircleFilled /> },
  partial: { type: 'warning', icon: <ExclamationCircleFilled /> },
  failed: { type: 'error', icon: <CloseCircleFilled /> }
};

const ExecuteResult = withLocale(({ payload, actionMap }) => {
  const { formatMessage, locale } = useIntl();
  const items = payload.results || [];
  return (
    <Flex vertical gap={16}>
      <ResultBanner
        type={payload.executedCount > 0 ? 'success' : 'default'}
        icon={payload.executedCount > 0 ? <CheckCircleFilled /> : <CloseCircleFilled />}
        title={formatMessage(
          { id: 'ExecuteBatchSummary' },
          { executed: payload.executedCount || 0, matched: payload.matchedCount || 0, total: payload.total || items.length }
        )}
      />
      {items.map(item => {
        if (!item.executed) {
          return (
            <div key={item.mailId} className={style['test-mail-item']}>
              <div className={style['test-mail-item-head']}>
                <span className={classnames(style['test-condition-icon'], style['is-unmatched'])}>
                  <CloseCircleFilled />
                </span>
                <Typography.Text ellipsis className={style['test-mail-item-subject']}>
                  {item.subject || formatMessage({ id: 'NoSubject' })}
                </Typography.Text>
                <span className={style['test-condition-state']}>{formatMessage({ id: 'ExecuteRuleSkipped' })}</span>
              </div>
            </div>
          );
        }
        const execution = item.execution || {};
        const status = enums.mailRuleLogStatus({ locale }).find(row => row.value === execution.status);
        const actionResults = execution.results || [];
        const banner = EXECUTE_BANNER[execution.status] || EXECUTE_BANNER.failed;
        return (
          <div key={item.mailId} className={style['test-mail-item']}>
            <div className={style['test-mail-item-head']}>
              <span className={classnames(style['test-condition-icon'], style[`is-${banner.type}`])}>{banner.icon}</span>
              <Typography.Text ellipsis className={style['test-mail-item-subject']}>
                {item.subject || formatMessage({ id: 'NoSubject' })}
              </Typography.Text>
              <Tag color={banner.type === 'default' ? undefined : banner.type}>{status?.description || execution.status}</Tag>
            </div>
            <Flex vertical gap={12} className={style['test-mail-item-conditions']}>
              {actionResults.map((actionItem, index) => (
                <ResultItem key={index} item={actionItem} index={index} actionMap={actionMap} formatMessage={formatMessage} />
              ))}
            </Flex>
          </div>
        );
      })}
    </Flex>
  );
});

const TestRuleButton = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset', 'components-core:Modal@useModal']
})(
  withLocale(({ remoteModules, data, apis: unitApis, onSuccess, options, getFormInner, fetchOptions, actionMap = new Map(), ...props }) => {
    const [FormInfo, usePreset, useModal] = remoteModules;
    const { ajax, apis } = usePreset();
    const formModal = FormInfo.useFormModal();
    const modal = useModal();
    const { message } = App.useApp();
    const { formatMessage, locale } = useIntl();
    const conditionExtensions = useConditionExtensions(apis);
    const conditionMap = new Map(conditionExtensions.map(item => [item.type, item]));
    const actions = data.actions || [];
    const normalizeMailIds = value =>
      []
        .concat(value || [])
        .filter(Boolean)
        .map(String);
    const executeRule = async mailIds => {
      const { data: resData } = await ajax(Object.assign({}, apis.mailGateway.rule.execute, { urlParams: { id: data.id }, data: { mailIds } }));
      if (resData.code !== 0) {
        return false;
      }
      if (!(resData.data.executedCount > 0)) {
        message.warning(formatMessage({ id: 'ExecuteRuleNotMatched' }));
        return;
      }
      modal({
        title: formatMessage({ id: 'ExecuteRuleResult' }),
        children: <ExecuteResult payload={resData.data} actionMap={actionMap} />,
        footerButtons: [{ type: 'primary', children: formatMessage({ id: 'Close' }) }]
      });
    };
    return (
      <Button
        {...props}
        onClick={() => {
          formModal({
            title: formatMessage({ id: 'TestRule' }),
            size: 'small',
            okText: formatMessage({ id: 'Execute' }),
            formProps: {
              onSubmit: async formData => {
                const mailIds = normalizeMailIds(formData.mailIds);
                if (mailIds.length === 0) {
                  message.warning(formatMessage({ id: 'SelectTestMail' }));
                  return false;
                }
                if (mailIds.length > 20) {
                  message.warning(formatMessage({ id: 'TestMailMaxCount' }));
                  return false;
                }
                const { data: resData } = await ajax(Object.assign({}, apis.mailGateway.rule.test, { data: { id: data.id, mailIds } }));
                if (resData.code !== 0) {
                  return false;
                }
                const executable = !['beforeSend', 'schedule'].includes(data.direction) && resData.data.matchedCount > 0 && actions.length > 0;
                const matchedMailIds = (resData.data.results || []).filter(item => item.matched).map(item => item.mailId);
                modal({
                  title: formatMessage({ id: 'TestResult' }),
                  size: 'small',
                  children: (
                    <TestResult
                      payload={resData.data}
                      conditions={data.conditions}
                      direction={data.direction}
                      actions={actions}
                      actionMap={actionMap}
                      conditionMap={conditionMap}
                    />
                  ),
                  footerButtons: [
                    { type: executable ? 'default' : 'primary', children: formatMessage({ id: 'Close' }) },
                    {
                      type: 'primary',
                      display: executable,
                      children: formatMessage({ id: 'ExecuteRule' }),
                      onClick: () => executeRule(matchedMailIds)
                    }
                  ]
                });
              }
            },
            children: (
              <Flex vertical gap={8}>
                <Typography.Text type="secondary">{formatConditions(data.conditions, { formatMessage, locale, conditionMap })}</Typography.Text>
                <FormInfo
                  column={1}
                  list={[
                    <MailSelectField
                      name="mailIds"
                      label={formatMessage({ id: 'TestMail' })}
                      rule="REQ"
                      tips={formatMessage({ id: 'TestMailMaxCount' })}
                      folder={['receive', 'schedule'].includes(data.direction) ? 'inbox' : 'sent'}
                    />
                  ]}
                />
              </Flex>
            )
          });
        }}
      />
    );
  })
);

export default TestRuleButton;
