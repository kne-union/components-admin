import { createWithRemoteLoader } from '@kne/remote-loader';
import { useFetch } from '@kne/react-fetch';
import { useRef } from 'react';
import { Alert, Button, Flex, Typography } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import get from 'lodash/get';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { registerMailActionFields } from './actionFields';
import style from '../style.module.scss';

export const useActionList = apis => {
  const { data } = useFetch(Object.assign({}, apis.mailGateway.action.list));
  return Array.isArray(data) ? data : [];
};

/**
 * 动作链：每个动作是 actions 分组里的一项，参数子表单按动作元数据的 formSchema 用 FormCreator 渲染，
 * 表单值为 { type, ...params }，提交时由 toRulePayload 转回 { type, params }
 */
const ActionsField = createWithRemoteLoader({
  modules: [
    'components-core:FormInfo',
    'components-core:FormInfo@GroupList',
    'components-core:Global@usePreset',
    'components-thirdparty:FormCreator@SchemaRendererInner',
    'components-thirdparty:FormCreator@preset'
  ]
})(
  withLocale(({ remoteModules }) => {
    const [FormInfo, GroupList, usePreset, SchemaRendererInner, formCreatorPreset] = remoteModules;
    const { Select } = FormInfo.fields;
    const { apis } = usePreset();
    const { formatMessage, locale } = useIntl();
    registerMailActionFields(formCreatorPreset, locale);
    const { formData, openApi } = FormInfo.useFormContext();
    const groupRef = useRef(null);
    const actionList = useActionList(apis);
    const direction = formData?.direction || 'receive';
    const available = actionList.filter(item => (item.directions || ['receive', 'send']).includes(direction));
    const getMeta = type => actionList.find(item => item.type === type);
    const move = (index, target) => {
      const data = openApi.getFormData();
      const next = (data.actions || []).slice(0);
      [next[index], next[target]] = [next[target], next[index]];
      openApi.setFormData(Object.assign({}, data, { actions: next }), false);
    };

    return (
      <Flex vertical gap={12} className={style['rule-editor']}>
        <GroupList name="actions" ref={groupRef} defaultLength={1} reverseOrder={false}>
          {({ id, index, length, onRemove }) => {
            const type = get(formData, ['actions', index, 'type']);
            const meta = getMeta(type);
            const directionMismatch = meta && !(meta.directions || ['receive', 'send']).includes(direction);
            return (
              <div key={id} className={style['action-item']}>
                <div className={style['action-item-head']}>
                  <span className={style['rule-step']}>{index + 1}</span>
                  <div className={style['rule-card-select']}>
                    <Select
                      name="type"
                      label={formatMessage({ id: 'Action' })}
                      labelHidden
                      rule="REQ"
                      variant="borderless"
                      placeholder={formatMessage({ id: 'SelectAction' })}
                      options={available.map(action => ({ label: action.label || action.type, value: action.type }))}
                    />
                  </div>
                  <div className={style['action-item-tools']}>
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowUpOutlined />}
                      title={formatMessage({ id: 'MoveUp' })}
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowDownOutlined />}
                      title={formatMessage({ id: 'MoveDown' })}
                      disabled={index === length - 1}
                      onClick={() => move(index, index + 1)}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      title={formatMessage({ id: 'Delete' })}
                      disabled={length <= 1}
                      onClick={onRemove}
                    />
                  </div>
                </div>
                <Flex vertical gap={12} className={style['action-item-body']}>
                  {meta?.description && <Typography.Text type="secondary">{meta.description}</Typography.Text>}
                  {directionMismatch && <Alert type="warning" showIcon message={formatMessage({ id: 'ActionDirectionMismatch' })} />}
                  {!meta && type && <Alert type="warning" showIcon message={formatMessage({ id: 'ActionNotRegistered' }, { type })} />}
                  {meta && !meta.formSchema && !meta.description && (
                    <Typography.Text type="secondary">{formatMessage({ id: 'NoActionParams' })}</Typography.Text>
                  )}
                  {meta?.formSchema && (
                    <SchemaRendererInner key={type} schema={meta.formSchema} showActions={false} className={style['action-form']} />
                  )}
                </Flex>
              </div>
            );
          }}
        </GroupList>
        <Button
          type="link"
          icon={<PlusOutlined />}
          className={style['action-add']}
          disabled={available.length === 0}
          onClick={() => groupRef.current?.onAdd()}
        >
          {formatMessage({ id: 'AddAction' })}
        </Button>
      </Flex>
    );
  })
);

export default ActionsField;
