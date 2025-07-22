import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useState } from 'react';
import { Button, App } from 'antd';
import getColumns from './getColumns';
import FormInner from './FormInner';
import Record from './Record';

const Webhook = createWithRemoteLoader({
  modules: [
    'components-core:Global@usePreset',
    'components-core:Layout@TablePage',
    'components-core:Layout@Menu',
    'components-core:FormInfo@useFormModal',
    'components-core:LoadingButton',
    'components-core:Modal@useModal'
  ]
})(({ remoteModules, ...props }) => {
  const [usePreset, TablePage, Menu, useFormModal, LoadingButton, useModal] = remoteModules;
  const { apis, ajax } = usePreset();
  const [current, setCurrent] = useState('');
  const formModal = useFormModal();
  const modal = useModal();
  const { message } = App.useApp();
  return (
    <Fetch
      {...Object.assign({}, apis.webhook.list)}
      render={({ data, reload }) => {
        const list = Object.keys(data);
        !(current && data[current]) && setCurrent(list[0]);
        return (
          <TablePage
            {...props}
            params={{ current, data }}
            loader={({ params }) => {
              return { pageData: params.data[params.current] };
            }}
            columns={[
              ...getColumns({
                renderCopyInvokeUrl: () => {
                  return (
                    <LoadingButton
                      type="link"
                      className="btn-no-padding"
                      onClick={async () => {
                        await navigator.clipboard.writeText(`${window.location.origin}${apis.webhook.invoke.url}/${current}`);
                        message.success('复制成功');
                      }}
                    >
                      复制
                    </LoadingButton>
                  );
                },
                renderCopySignature: item => {
                  return (
                    <LoadingButton
                      type="link"
                      className="btn-no-padding"
                      onClick={async () => {
                        await navigator.clipboard.writeText(item.signature);
                        message.success('复制成功');
                      }}
                    >
                      复制
                    </LoadingButton>
                  );
                }
              }),
              {
                name: 'options',
                type: 'options',
                title: '操作',
                fixed: 'right',
                valueOf: item => {
                  return [
                    {
                      children: '调用记录',
                      onClick: async () => {
                        modal({
                          title: '调用记录',
                          footer: null,
                          children: <Record id={item.id} />
                        });
                      }
                    },
                    {
                      children: '删除',
                      confirm: true,
                      onClick: async () => {
                        const { data: resData } = await ajax(
                          Object.assign({}, apis.webhook.remove, {
                            data: { id: item.id }
                          })
                        );
                        if (resData.code !== 0) {
                          return;
                        }
                        message.success('删除成功');
                        reload();
                      }
                    }
                  ];
                }
              }
            ]}
            page={{
              menu: list.length > 0 && (
                <Menu
                  currentKey={current}
                  onChange={setCurrent}
                  items={list.map(name => {
                    return {
                      key: name,
                      label: name
                    };
                  })}
                />
              ),
              title: 'Webhook',
              titleExtra: (
                <Button
                  type="primary"
                  onClick={() => {
                    formModal({
                      title: '添加Webhook调用端',
                      size: 'small',
                      autoClose: true,
                      formProps: {
                        onSubmit: async formData => {
                          const { data: resData } = await ajax(
                            Object.assign({}, apis.webhook.create, {
                              data: Object.assign({}, formData, {
                                type: current
                              })
                            })
                          );

                          if (resData.code !== 0) {
                            return false;
                          }

                          message.success('添加成功');
                          reload();
                        }
                      },
                      children: <FormInner />
                    });
                  }}
                >
                  添加
                </Button>
              )
            }}
          />
        );
      }}
    />
  );
});

export default Webhook;
