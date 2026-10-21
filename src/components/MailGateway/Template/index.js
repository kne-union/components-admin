import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useIntl } from '@kne/react-intl';
import BizUnit from '@components/BizUnit';
import withLocale from '../withLocale';
import enums from '../enums';
import { useBizUnitPage } from '../PageLayout';
import { useTemplateCategoryList } from '../fields';
import getColumns from './getColumns';
import FormInner, { toTemplatePayload } from './FormInner';
import { CopyTemplateButton, getSystemLockedActions, openTemplatePreview, PreviewTemplateButton } from './ActionButtons';
import { createCardRenders, EnumTag, formatDateTime } from '../CardList';

const Template = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Filter', 'components-core:Modal@useModal']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [usePreset, Filter, useModal] = remoteModules;
    const { SuperSelectFilterItem } = Filter.fields;
    const { apis } = usePreset();
    const modal = useModal();
    const { formatMessage, locale } = useIntl();
    const navigate = useNavigate();
    const templateApis = apis.mailGateway.template;
    const { list: categories } = useTemplateCategoryList(apis);
    const onPreview = template => openTemplatePreview({ modal, formatMessage, template });

    return (
      <BizUnit
        isNext
        name="mail-gateway-template"
        {...useBizUnitPage({ title: formatMessage({ id: 'TemplateManage' }), baseUrl, pageProps })}
        titleExtra={<Button onClick={() => navigate(`${baseUrl}/template-categories`)}>{formatMessage({ id: 'TemplateCategoryManage' })}</Button>}
        apis={{
          list: Object.assign({}, templateApis.list, { params: { filter: {} } }),
          create: ({ formData }) => Object.assign({}, templateApis.create, { data: toTemplatePayload(formData) }),
          save: ({ formData, data }) => Object.assign({}, templateApis.save, { urlParams: { id: data.id }, data: toTemplatePayload(formData) }),
          remove: ({ data }) => Object.assign({}, templateApis.remove, { urlParams: { id: data.id } }),
          setStatus: ({ data }) =>
            Object.assign({}, templateApis.setStatus, {
              urlParams: { id: data.id },
              data: { status: data.status === 'enabled' ? 'disabled' : 'enabled' }
            })
        }}
        getColumns={() => getColumns({ formatMessage, onPreview })}
        getFormInner={() => <FormInner />}
        getActionList={props => [
          ...getSystemLockedActions(props.data),
          { ...props, buttonComponent: PreviewTemplateButton, children: formatMessage({ id: 'Preview' }) },
          { ...props, buttonComponent: CopyTemplateButton, children: formatMessage({ id: 'Copy' }) }
        ]}
        filter={{
          list: [
            {
              type: SuperSelectFilterItem,
              props: {
                name: 'categoryId',
                label: formatMessage({ id: 'TemplateCategory' }),
                single: true,
                options: [
                  ...categories.map(item => ({ label: item.name, value: item.id })),
                  { label: formatMessage({ id: 'Uncategorized' }), value: 'none' }
                ]
              }
            },
            {
              type: SuperSelectFilterItem,
              props: {
                name: 'level',
                label: formatMessage({ id: 'TemplateLevel' }),
                single: true,
                options: enums.mailTemplateLevel({ locale }).map(item => ({ label: item.description, value: String(item.value) }))
              }
            },
            {
              type: SuperSelectFilterItem,
              props: {
                name: 'status',
                label: formatMessage({ id: 'Status' }),
                single: true,
                options: enums.mailTemplateStatus({ locale }).map(item => ({ label: item.description, value: item.value }))
              }
            }
          ]
        }}
        options={{
          bizName: formatMessage({ id: 'Template' }),
          keywordFilterLabel: formatMessage({ id: 'TemplateKeyword' }),
          openStatus: 'enabled',
          closedStatus: 'disabled',
          formSize: 'large',
          saveData: data => ({
            name: data.name,
            categoryId: data.categoryId || undefined,
            subject: data.subject,
            html: data.html,
            description: data.description
          }),
          removeMessage: formatMessage({ id: 'ConfirmRemoveTemplate' }),
          openButtonProps: { children: formatMessage({ id: 'Enable' }) },
          closeButtonProps: { children: formatMessage({ id: 'Disable' }) },
          tableProps: createCardRenders(item => ({
            title: (
              <Typography.Link
                onClick={e => {
                  e.stopPropagation();
                  onPreview(item);
                }}
              >
                {item.name}
              </Typography.Link>
            ),
            extra: (
              <>
                <Tag>{item.category?.name || formatMessage({ id: 'Uncategorized' })}</Tag>
                <EnumTag moduleName="mailTemplateLevel" value={Number(item.level ?? 1)} locale={locale} />
                <EnumTag moduleName="mailTemplateStatus" value={item.status} locale={locale} />
              </>
            ),
            muted: item.status !== 'enabled',
            subtitle: `${formatMessage({ id: 'Subject' })}：${item.subject || '-'}`,
            description: item.description,
            footer: item.updatedAt && `${formatMessage({ id: 'UpdatedAt' })} ${formatDateTime(item.updatedAt)}`
          }))
        }}
      />
    );
  })
);

export default Template;
