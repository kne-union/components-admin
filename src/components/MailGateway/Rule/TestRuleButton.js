import { createWithRemoteLoader } from '@kne/remote-loader';
import { useFetch } from '@kne/react-fetch';
import { App, Button, Flex, Select, Tag, Typography } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { formatAddressNames } from '../utils';
import { createField } from '../fields';
import { createConditionMaps, formatConditionItem, formatConditions } from './getColumns';
import { useConditionExtensions } from './ConditionsField';
import style from '../style.module.scss';

const MailSelect = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, folder, ...props }) => {
    const [usePreset] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const { data } = useFetch(Object.assign({}, apis.mailGateway.mail.list, { params: { perPage: 50, filter: { folder } } }));
    return (
      <Select
        showSearch
        optionFilterProp="label"
        placeholder={formatMessage({ id: 'SelectTestMail' })}
        {...props}
        options={(data?.pageData || []).map(item => ({
          label: `${item.subject || formatMessage({ id: 'NoSubject' })} - ${formatAddressNames(folder === 'sent' ? item.to : item.from)}`,
          value: item.id
        }))}
      />
    );
  })
);

const MailSelectField = createField(MailSelect);

const TestResultTag = ({ item, formatMessage }) => {
  if (item.skipped) {
    return <Tag>{formatMessage({ id: 'TestSkipped' })}</Tag>;
  }
  return <Tag color={item.matched ? 'success' : 'error'}>{formatMessage({ id: item.matched ? 'Yes' : 'No' })}</Tag>;
};

const TestResult = withLocale(({ result, conditionMap }) => {
  const { formatMessage, locale } = useIntl();
  const maps = createConditionMaps({ locale, conditionMap });
  return (
    <Flex vertical gap={8}>
      <div>
        <Tag color={result.matched ? 'success' : 'default'}>{formatMessage({ id: result.matched ? 'TestMatched' : 'TestNotMatched' })}</Tag>
      </div>
      {!result.accountMatched && <Typography.Text type="warning">{formatMessage({ id: 'TestAccountNotMatched' })}</Typography.Text>}
      <ul className={style['test-result-list']}>
        {(result.details || []).map((item, index) => (
          <li key={index}>
            <TestResultTag item={item} formatMessage={formatMessage} />
            {formatConditionItem(item, maps)}
            {item.reason && (
              <Typography.Text type="secondary" className={style['test-result-note']}>
                {item.reason}
              </Typography.Text>
            )}
            {item.error && (
              <Typography.Text type="danger" className={style['test-result-note']}>
                {formatMessage({ id: 'TestConditionError' }, { error: item.error })}
              </Typography.Text>
            )}
          </li>
        ))}
      </ul>
      {(result.details || []).length === 0 && <Typography.Text type="secondary">{formatMessage({ id: 'EmptyConditionsTips' })}</Typography.Text>}
    </Flex>
  );
});

const TestRuleButton = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, data, apis: unitApis, onSuccess, options, getFormInner, fetchOptions, ...props }) => {
    const [FormInfo, usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const formModal = FormInfo.useFormModal();
    const { modal } = App.useApp();
    const { formatMessage, locale } = useIntl();
    const conditionExtensions = useConditionExtensions(apis);
    const conditionMap = new Map(conditionExtensions.map(item => [item.type, item]));
    return (
      <Button
        {...props}
        onClick={() => {
          formModal({
            title: formatMessage({ id: 'TestRule' }),
            size: 'small',
            formProps: {
              onSubmit: async formData => {
                const { data: resData } = await ajax(
                  Object.assign({}, apis.mailGateway.rule.test, { data: { id: data.id, mailId: formData.mailId } })
                );
                if (resData.code !== 0) {
                  return false;
                }
                modal.info({
                  title: formatMessage({ id: 'TestResult' }),
                  content: <TestResult result={resData.data} conditionMap={conditionMap} />
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
                      name="mailId"
                      label={formatMessage({ id: 'TestMail' })}
                      rule="REQ"
                      folder={data.direction === 'send' ? 'sent' : 'inbox'}
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
