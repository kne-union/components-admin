import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Button, App } from 'antd';
import { useState, forwardRef, useImperativeHandle } from 'react';
import Fetch from '@kne/react-fetch';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';
import style from './style.module.scss';

const resolveSiteHost = host => {
  if (!host) {
    return host;
  }
  if (String(host).startsWith('localStorage:') || /^https?:\/\//i.test(String(host))) {
    return String(host);
  }
  try {
    return new URL(String(host), window.location.origin).href;
  } catch {
    return String(host);
  }
};

const mapSiteList = pageData => {
  return (Array.isArray(pageData) ? pageData : [])
    .filter(item => item && item.status !== 'closed' && item.host)
    .map(item => ({
      host: resolveSiteHost(item.host),
      name: item.name || item.host
    }));
};

const LiveComponent = createWithRemoteLoader({
  modules: ['components-thirdparty:LiveComponentEditor', 'components-core:Global@usePreset']
})(
  forwardRef(({ remoteModules, defaultValue }, ref) => {
    const [LiveComponentEditor, usePreset] = remoteModules;
    const { apis } = usePreset();
    const [value, setValue] = useState(defaultValue || '');
    const siteListApi = apis?.liveComponentsSite?.list;
    useImperativeHandle(ref, () => {
      return {
        getValue: () => value
      };
    });

    const editor = sites => (
      <Flex vertical gap={8} className={style['editor-wrap']}>
        <LiveComponentEditor
          onChange={setValue}
          defaultValue={value}
          height={560}
          sites={sites}
          siteActionsOpen
        />
      </Flex>
    );

    if (!siteListApi) {
      return editor([]);
    }

    return (
      <Fetch
        {...Object.assign({}, siteListApi, {
          params: Object.assign({ currentPage: 1, perPage: 100, status: 'open' }, siteListApi.params)
        })}
        render={({ data }) => {
          const sites = mapSiteList(data?.pageData || data);
          return editor(sites);
        }}
        error={() => editor([])}
      />
    );
  })
);

const CustomComponentFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules, isEdit }) => {
    const [FormInfo] = remoteModules;
    const { formatMessage } = useIntl();
    const { Input, TextArea } = FormInfo.fields;

    return (
      <FormInfo
        column={1}
        list={[
          <Input name="key" label="KEY" rule="REQ LEN-0-100" disabled={isEdit} />,
          <Input name="name" label={formatMessage({ id: 'Name' })} rule="REQ LEN-0-100" />,
          <Input name="type" label={formatMessage({ id: 'Type' })} rule="REQ LEN-0-100" />,
          <TextArea name="description" label={formatMessage({ id: 'Description' })} rule="LEN-0-500" />
        ]}
      />
    );
  })
);

const CustomComponents = createWithRemoteLoader({
  modules: [
    'components-core:Global@usePreset',
    'components-core:TablePage@Table',
    'components-core:FormInfo',
    'components-core:Modal@useModal',
    'components-core:Modal@ModalButton',
    'components-thirdparty:LiveComponentView'
  ]
})(
  withLocale(({ remoteModules, tenant, reload }) => {
    const [usePreset, Table, FormInfo, useModal, ModalButton, LiveComponentView] = remoteModules;
    const { formatMessage } = useIntl();
    const { apis, ajax } = usePreset();
    const { useFormModal, Form } = FormInfo;
    const formModal = useFormModal();
    const { message } = App.useApp();
    const modal = useModal();
    const customComponents = tenant.tenantSetting?.customComponents || [];

    return (
      <Flex vertical gap={8}>
        <Flex justify="flex-end">
          <Button
            type="primary"
            size="small"
            onClick={() => {
              const modalApi = modal({
                title: formatMessage({ id: 'AddCustomComponent' }),
                size: 'large',
                wrapClassName: style['modal-wrap'],
                classNames: {
                  wrapper: style['modal-wrap']
                },
                children: ({ childrenRef }) => <LiveComponent ref={childrenRef} />,
                onConfirm: async (e, { childrenRef }) => {
                  const content = childrenRef.current.getValue();
                  formModal({
                    title: formatMessage({ id: 'AddCustomComponent' }),
                    size: 'small',
                    formProps: {
                      onSubmit: async formData => {
                        const { data: resData } = await ajax(
                          Object.assign({}, apis.tenantAdmin.appendCustomComponent, {
                            data: {
                              tenantId: tenant.id,
                              customComponent: Object.assign({}, formData, {
                                content
                              })
                            }
                          })
                        );

                        if (resData.code !== 0) {
                          return false;
                        }
                        message.success(formatMessage({ id: 'AddSuccess' }));
                        modalApi.close();
                        reload();
                      }
                    },
                    children: <CustomComponentFormInner />
                  });
                  return false;
                }
              });
            }}
          >
            {formatMessage({ id: 'AddCustomComponent' })}
          </Button>
        </Flex>
        <Table
          rowKey="key"
          dataSource={customComponents}
          columns={[
            {
              name: 'key',
              title: 'KEY'
            },
            {
              name: 'name',
              title: formatMessage({ id: 'Name' })
            },
            {
              name: 'type',
              title: formatMessage({ id: 'Type' })
            },
            {
              name: 'description',
              title: formatMessage({ id: 'Description' }),
              renderType: 'description'
            },
            {
              name: 'options',
              renderType: 'options',
              title: formatMessage({ id: 'Operation' }),
              fixed: 'right',
              getValueOf: item => {
                return [
                  {
                    buttonComponent: ModalButton,
                    children: formatMessage({ id: 'Preview' }),
                    api: Object.assign({}, apis.tenantAdmin.customComponentDetail, {
                      params: {
                        tenantId: tenant.id,
                        key: item.key
                      }
                    }),
                    modalProps: ({ data }) => {
                      return {
                        title: formatMessage({ id: 'Preview' }),
                        footer: null,
                        children: (
                          <Form>
                            <LiveComponentView content={data.content} />
                          </Form>
                        )
                      };
                    }
                  },
                  {
                    buttonComponent: ModalButton,
                    children: formatMessage({ id: 'Edit' }),
                    api: Object.assign({}, apis.tenantAdmin.customComponentDetail, {
                      params: {
                        tenantId: tenant.id,
                        key: item.key
                      }
                    }),
                    modalProps: ({ data, close }) => {
                      return {
                        title: formatMessage({ id: 'Edit' }),
                        size: 'large',
                        children: ({ childrenRef }) => <LiveComponent defaultValue={data.content} ref={childrenRef} />,
                        onConfirm: (e, { childrenRef }) => {
                          const content = childrenRef.current.getValue();
                          formModal({
                            title: formatMessage({ id: 'EditCustomComponent' }),
                            size: 'small',
                            formProps: {
                              data: Object.assign({}, item),
                              onSubmit: async formData => {
                                const { data: resData } = await ajax(
                                  Object.assign({}, apis.tenantAdmin.saveCustomComponent, {
                                    data: {
                                      tenantId: tenant.id,
                                      customComponent: Object.assign({}, formData, {
                                        key: item.key,
                                        content
                                      })
                                    }
                                  })
                                );

                                if (resData.code !== 0) {
                                  return false;
                                }
                                message.success(formatMessage({ id: 'ModifySuccess' }));
                                close();
                                reload();
                              }
                            },
                            children: <CustomComponentFormInner isEdit />
                          });
                          return false;
                        }
                      };
                    }
                  },
                  {
                    children: formatMessage({ id: 'Copy' }),
                    onClick: async () => {
                      const { data: resData } = await ajax(
                        Object.assign({}, apis.tenantAdmin.copyCustomComponent, {
                          data: {
                            tenantId: tenant.id,
                            key: item.key
                          }
                        })
                      );
                      if (resData.code !== 0) {
                        return;
                      }
                      message.success(formatMessage({ id: 'CopySuccess' }));
                      reload();
                    }
                  },
                  {
                    children: formatMessage({ id: 'Delete' }),
                    confirm: true,
                    onClick: async () => {
                      const { data: resData } = await ajax(
                        Object.assign({}, apis.tenantAdmin.removeCustomComponent, {
                          data: {
                            tenantId: tenant.id,
                            key: item.key
                          }
                        })
                      );
                      if (resData.code !== 0) {
                        return;
                      }
                      message.success(formatMessage({ id: 'DeleteSuccess' }));
                      reload();
                    }
                  }
                ];
              }
            }
          ]}
        />
      </Flex>
    );
  })
);

export default CustomComponents;
