import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import merge from 'lodash/merge';
import { useIntl } from '@kne/react-intl';
import FormInner from './FormInner';
import LeaderFormInner from './LeaderFormInner';
import { normalizeLeaderUserIdForSubmit } from './normalizeLeaderUserIdForSubmit';

/** SuperSelect object-output-value 回显需 { id, name }，不能只传 id 字符串 */
const mapOrgToFormData = org => {
  let leaderUserId = null;
  if (org.leader?.id != null) {
    leaderUserId = { id: org.leader.id, name: org.leader.name };
  } else if (org.leaderUserId != null) {
    leaderUserId = {
      id: org.leaderUserId,
      ...(org.leaderName ? { name: org.leaderName } : {})
    };
  }
  return Object.assign({}, org, { leaderUserId });
};

const OrgOptions = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:ButtonGroup', 'components-core:Icon', 'components-core:FormInfo@useFormModal']
})(({ remoteModules, showLength = 3, variant = 'link', data, apis, onSuccess, onViewUsers }) => {
  const [usePreset, ButtonGroup, Icon, useFormModal] = remoteModules;
  const { ajax } = usePreset();
  const formModal = useFormModal();
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  const isExternalSource = data.synced && data.syncSource;
  const buttonType = variant === 'button' ? 'default' : 'link';
  return (
    <ButtonGroup
      itemClassName={variant === 'button' ? undefined : 'btn-no-padding'}
      moreType={buttonType}
      showLength={showLength}
      list={[
        {
          icon: <UserOutlined />,
          type: buttonType,
          size: 'small',
          children: formatMessage({ id: 'ViewUsers' }),
          hidden: !(data.id && data.id !== 'root') || typeof onViewUsers !== 'function',
          onClick: () => {
            onViewUsers(data);
          }
        },
        {
          icon: <Icon type="tianjia" />,
          type: buttonType,
          size: 'small',
          children: formatMessage({ id: 'AddSubOrg' }),
          hidden: !apis.create || isExternalSource,
          onClick: async () => {
            formModal({
              title: formatMessage({ id: 'AddSubOrg' }),
              size: 'small',
              formProps: {
                onSubmit: async formData => {
                  const { data: resData } = await ajax(
                    merge({}, apis.create, {
                      data: Object.assign(
                        {},
                        formData,
                        {
                          leaderUserId: normalizeLeaderUserIdForSubmit(formData.leaderUserId)
                        },
                        data.id && data.id !== 'root'
                          ? {
                              parentId: data.id
                            }
                          : {}
                      )
                    })
                  );
                  if (resData.code !== 0) {
                    return false;
                  }
                  message.success(formatMessage({ id: 'AddSuccess' }));
                  onSuccess && onSuccess();
                }
              },
              children: <FormInner apis={apis} context={{ label: formatMessage({ id: 'OrgFormParent' }), org: data }} />
            });
          }
        },
        {
          icon: <Icon type="bianji" />,
          type: buttonType,
          size: 'small',
          children: formatMessage({ id: 'Edit' }),
          hidden: !(data.id && data.id !== 'root') || !apis.save || isExternalSource,
          onClick: async () => {
            formModal({
              title: formatMessage({ id: 'EditOrgNode' }),
              size: 'small',
              formProps: {
                data: mapOrgToFormData(data),
                onSubmit: async formData => {
                  const { data: resData } = await ajax(
                    merge({}, apis.save, {
                      data: Object.assign({}, formData, {
                        parentId: data.parentId,
                        id: data.id,
                        leaderUserId: normalizeLeaderUserIdForSubmit(formData.leaderUserId)
                      })
                    })
                  );
                  if (resData.code !== 0) {
                    return false;
                  }
                  message.success(formatMessage({ id: 'SaveSuccess' }));
                  onSuccess && onSuccess();
                }
              },
              children: <FormInner apis={apis} orgId={data.id} />
            });
          }
        },
        {
          icon: <EditOutlined />,
          type: buttonType,
          size: 'small',
          children: formatMessage({ id: 'EditOrgLeader' }),
          hidden: !(data.id && data.id !== 'root') || !apis.save || !isExternalSource,
          onClick: async () => {
            formModal({
              title: formatMessage({ id: 'EditOrgLeader' }),
              size: 'small',
              formProps: {
                data: mapOrgToFormData(data),
                onSubmit: async formData => {
                  const { data: resData } = await ajax(
                    merge({}, apis.save, {
                      data: Object.assign(
                        {},
                        {
                          id: data.id,
                          parentId: data.parentId,
                          name: data.name,
                          description: data.description,
                          leaderUserId: normalizeLeaderUserIdForSubmit(formData.leaderUserId)
                        }
                      )
                    })
                  );
                  if (resData.code !== 0) {
                    return false;
                  }
                  message.success(formatMessage({ id: 'SaveSuccess' }));
                  onSuccess && onSuccess();
                }
              },
              children: <LeaderFormInner apis={apis} orgId={data.id} context={{ label: formatMessage({ id: 'OrgFormCurrent' }), org: data }} />
            });
          }
        },
        {
          icon: <Icon type="shanchu" />,
          type: buttonType,
          size: 'small',
          children: formatMessage({ id: 'Delete' }),
          hidden: !(data.id && data.id !== 'root') || !apis.remove || isExternalSource,
          confirm: true,
          isDelete: true,
          danger: true,
          disabled: data.children && data.children.length > 0,
          onClick: async () => {
            const { data: resData } = await ajax(
              merge({}, apis.remove, {
                data: { id: data.id }
              })
            );
            if (resData.code !== 0) {
              return;
            }
            message.success(formatMessage({ id: 'DeleteSuccess' }));
            onSuccess && onSuccess();
          }
        }
      ]}
    />
  );
});

export default OrgOptions;
