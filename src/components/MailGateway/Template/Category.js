import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef } from 'react';
import { Button, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useIntl } from '@kne/react-intl';
import BizUnit from '@components/BizUnit';
import withLocale from '../withLocale';
import Menu from '../Menu';
import { getMoveSortActions } from '../MoveSortButton';
import { createCardRenders, EnumTag } from '../CardList';
import { getSystemLockedActions } from './ActionButtons';

const CategoryFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules }) => {
    const [FormInfo] = remoteModules;
    const { Input, TextArea } = FormInfo.fields;
    const { formatMessage } = useIntl();
    return (
      <FormInfo
        column={1}
        list={[
          <Input name="name" label={formatMessage({ id: 'CategoryName' })} rule="REQ LEN-1-50" />,
          <TextArea name="description" label={formatMessage({ id: 'Description' })} />
        ]}
      />
    );
  })
);

const TemplateCategory = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [usePreset] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage, locale } = useIntl();
    const navigate = useNavigate();
    const categoryApis = apis.mailGateway.templateCategory;
    const listRef = useRef([]);
    const toPayload = formData => ({ name: formData.name, description: formData.description || '' });

    return (
      <BizUnit
        isNext
        name="mail-gateway-template-category"
        allowKeywordSearch={false}
        page={{
          title: formatMessage({ id: 'TemplateCategoryManage' }),
          menu: <Menu baseUrl={baseUrl} />,
          ...pageProps
        }}
        titleExtra={<Button onClick={() => navigate(`${baseUrl}/templates`)}>{formatMessage({ id: 'BackToTemplates' })}</Button>}
        apis={{
          list: Object.assign({}, categoryApis.list, {
            params: { perPage: 500 },
            transformData: data => {
              listRef.current = data?.pageData || [];
              return data;
            }
          }),
          create: ({ formData }) => Object.assign({}, categoryApis.create, { data: toPayload(formData) }),
          save: ({ formData, data }) => Object.assign({}, categoryApis.save, { urlParams: { id: data.id }, data: toPayload(formData) }),
          remove: ({ data }) => Object.assign({}, categoryApis.remove, { urlParams: { id: data.id } })
        }}
        getColumns={() => [
          { name: 'name', title: formatMessage({ id: 'CategoryName' }), renderType: 'main' },
          { name: 'level', title: formatMessage({ id: 'TemplateLevel' }), width: 100, renderType: 'enum', moduleName: 'mailTemplateLevel' },
          { name: 'description', title: formatMessage({ id: 'Description' }), renderType: 'description', width: 320 },
          { name: 'templateCount', title: formatMessage({ id: 'TemplateCount' }), width: 120, getValueOf: item => item.templateCount || 0 }
        ]}
        getFormInner={() => <CategoryFormInner />}
        getActionList={props => [
          ...getSystemLockedActions(props.data),
          ...getMoveSortActions({ props, listRef, sortApi: categoryApis.sort, formatMessage })
        ]}
        options={{
          bizName: formatMessage({ id: 'TemplateCategory' }),
          saveData: data => ({ name: data.name, description: data.description }),
          removeMessage: formatMessage({ id: 'ConfirmRemoveTemplateCategory' }),
          tableProps: Object.assign(
            { pagination: { open: false } },
            createCardRenders(item => ({
              title: item.name,
              extra: (
                <>
                  <EnumTag moduleName="mailTemplateLevel" value={Number(item.level ?? 1)} locale={locale} />
                  <Tag color="blue">
                    {formatMessage({ id: 'TemplateCount' })} {item.templateCount || 0}
                  </Tag>
                </>
              ),
              description: item.description
            }))
          )
        }}
      />
    );
  })
);

export default TemplateCategory;
