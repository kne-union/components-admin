import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo, useRef } from 'react';
import { Tag } from 'antd';
import { useIntl } from '@kne/react-intl';
import BizUnit from '@components/BizUnit';
import withLocale from '../withLocale';
import { useBizUnitPage } from '../PageLayout';
import { getMoveSortActions } from '../MoveSortButton';
import { AccountSelectField, useAccountList } from '../fields';
import { createCardRenders, EnumTag } from '../CardList';
import style from '../style.module.scss';

const isSystemLabel = data => Number(data?.level) === 0;

const getSystemLockedActions = data =>
  ['save', 'remove'].map(name => ({ name, reset: ({ hidden }) => ({ name, hidden: hidden || isSystemLabel(data) }) }));

const LabelFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules }) => {
    const [FormInfo] = remoteModules;
    const { Input, ColorPicker, InputNumber } = FormInfo.fields;
    const { formatMessage } = useIntl();
    return (
      <FormInfo
        column={1}
        list={[
          <Input name="name" label={formatMessage({ id: 'LabelName' })} rule="REQ LEN-1-30" />,
          <ColorPicker name="color" label={formatMessage({ id: 'Color' })} defaultValue="#1677ff" />,
          <AccountSelectField name="accountId" label={formatMessage({ id: 'Account' })} tips={formatMessage({ id: 'LabelAccountTips' })} />,
          <InputNumber name="sort" label={formatMessage({ id: 'Sort' })} min={0} />
        ]}
      />
    );
  })
);

const Label = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [usePreset] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage, locale } = useIntl();
    const labelApis = apis.mailGateway.label;
    const listRef = useRef([]);
    const { list: accounts } = useAccountList(apis);
    const accountMap = useMemo(() => new Map(accounts.map(item => [String(item.id), item])), [accounts]);

    return (
      <BizUnit
        isNext
        name="mail-gateway-label"
        allowKeywordSearch={false}
        {...useBizUnitPage({ title: formatMessage({ id: 'LabelManage' }), baseUrl, pageProps })}
        apis={{
          list: Object.assign({}, labelApis.list, {
            transformData: data => {
              listRef.current = Array.isArray(data) ? data : [];
              return { pageData: listRef.current, totalCount: listRef.current.length };
            }
          }),
          create: ({ formData }) => Object.assign({}, labelApis.create, { data: formData }),
          save: ({ formData, data }) =>
            Object.assign({}, labelApis.save, { urlParams: { id: data.id }, data: Object.assign({ accountId: null }, formData) }),
          remove: ({ data }) => Object.assign({}, labelApis.remove, { urlParams: { id: data.id } })
        }}
        getColumns={() => [
          {
            name: 'name',
            title: formatMessage({ id: 'LabelName' }),
            width: 200,
            render: (value, { dataSource }) => <Tag color={dataSource.color}>{value}</Tag>
          },
          {
            name: 'accountId',
            title: formatMessage({ id: 'Account' }),
            width: 200,
            getValueOf: item =>
              item.accountId ? accountMap.get(String(item.accountId))?.name || item.accountId : formatMessage({ id: 'GlobalLabel' })
          },
          {
            name: 'level',
            title: formatMessage({ id: 'TemplateLevel' }),
            width: 100,
            renderType: 'enum',
            moduleName: 'mailTemplateLevel'
          },
          { name: 'color', title: formatMessage({ id: 'Color' }), width: 120 },
          { name: 'sort', title: formatMessage({ id: 'Sort' }), width: 100 }
        ]}
        getFormInner={() => <LabelFormInner />}
        getActionList={props => [
          ...getSystemLockedActions(props.data),
          ...getMoveSortActions({ props, listRef, sortApi: labelApis.sort, formatMessage })
        ]}
        options={{
          bizName: formatMessage({ id: 'Label' }),
          removeMessage: formatMessage({ id: 'ConfirmRemoveLabel' }),
          tableProps: Object.assign(
            { pagination: { open: false } },
            createCardRenders(item => ({
              title: <Tag color={item.color}>{item.name}</Tag>,
              extra: (
                <>
                  <EnumTag moduleName="mailTemplateLevel" value={Number(item.level ?? 1)} locale={locale} />
                  <span className={style['card-label-color']}>
                    <span className={style['label-dot']} style={{ background: item.color }} />
                    {item.color}
                  </span>
                </>
              ),
              subtitle: item.accountId ? accountMap.get(String(item.accountId))?.name || item.accountId : formatMessage({ id: 'GlobalLabel' }),
              footer: `${formatMessage({ id: 'Sort' })} ${item.sort ?? 0}`
            }))
          )
        }}
      />
    );
  })
);

export default Label;
