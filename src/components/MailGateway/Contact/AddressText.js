import { createWithRemoteLoader } from '@kne/remote-loader';
import { Fragment, useState } from 'react';
import { App, Button, Popover, Typography } from 'antd';
import { FormOutlined, UserAddOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { formatAddress, getDefaultAccountId } from '../utils';
import { useOpenCompose } from '../Mailbox/Compose';
import ContactFormInner, { toContactPayload } from './FormInner';
import ContactAvatar from './ContactAvatar';
import style from '../style.module.scss';

/**
 * 展示一个邮件地址，点击弹出名称、地址和「写邮件」「添加到联系人」
 */
export const AddressText = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, value, full, className, onAdded }) => {
    const [FormInfo, usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    const formModal = FormInfo.useFormModal();
    const openCompose = useOpenCompose({ FormInfo, usePreset });
    const [open, setOpen] = useState(false);
    const [composing, setComposing] = useState(false);
    // undefined: 查询中，null: 不是联系人
    const [contact, setContact] = useState(undefined);

    if (!value?.address) {
      return null;
    }

    const loadContact = async () => {
      setContact(undefined);
      try {
        const { data: resData } = await ajax(
          Object.assign({}, apis.mailGateway.contact.list, { params: { perPage: 1, filter: { address: value.address } } })
        );
        setContact(resData.code === 0 ? resData.data.pageData?.[0] || null : null);
      } catch (e) {
        setContact(null);
      }
    };

    const handleOpenChange = next => {
      setOpen(next);
      next && loadContact();
    };

    // 卡片在列表每行都会渲染，账号列表只在点击时取一次，用于选默认发件邮箱
    const composeMail = async () => {
      setComposing(true);
      let accountId;
      try {
        const { data: resData } = await ajax(Object.assign({}, apis.mailGateway.account.list, { params: { perPage: 100 } }));
        accountId = resData.code === 0 ? getDefaultAccountId(resData.data.pageData) : undefined;
      } catch (e) {
        accountId = undefined;
      } finally {
        setComposing(false);
      }
      setOpen(false);
      openCompose({ accountId, to: [{ name: contact?.name || value.name, address: value.address }] });
    };

    const addContact = () => {
      setOpen(false);
      formModal({
        title: formatMessage({ id: 'AddToContact' }),
        size: 'small',
        formProps: {
          data: { name: value.name, address: value.address },
          onSubmit: async formData => {
            const { data: resData } = await ajax(Object.assign({}, apis.mailGateway.contact.create, { data: toContactPayload(formData) }));
            if (resData.code !== 0) {
              return false;
            }
            message.success(formatMessage({ id: 'OperationSuccess' }));
            setContact(resData.data);
            onAdded && onAdded(resData.data);
          }
        },
        children: <ContactFormInner />
      });
    };

    return (
      <Popover
        open={open}
        onOpenChange={handleOpenChange}
        trigger="click"
        content={
          <div className={style['address-card']} onClick={e => e.stopPropagation()}>
            <div className={style['address-card-head']}>
              <ContactAvatar contact={contact || value} size={40} />
              <div className={style['address-card-info']}>
                <Typography.Text strong ellipsis className={style['address-card-name']}>
                  {contact?.name || value.name || value.address}
                </Typography.Text>
                <Typography.Text type="secondary" copyable className={style['address-card-address']}>
                  {value.address}
                </Typography.Text>
              </div>
            </div>
            <div className={style['address-card-actions']}>
              <Button type="primary" icon={<FormOutlined />} loading={composing} onClick={composeMail}>
                {formatMessage({ id: 'Compose' })}
              </Button>
              {contact === null && (
                <Button icon={<UserAddOutlined />} onClick={addContact}>
                  {formatMessage({ id: 'AddToContact' })}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <span className={classnames(style['address-text'], className)} onClick={e => e.stopPropagation()}>
          {full ? formatAddress(value) : value.name || value.address}
        </span>
      </Popover>
    );
  })
);

export const AddressList = ({ list, full, className, empty = null }) => {
  const items = (list || []).filter(item => item?.address);
  if (items.length === 0) {
    return empty;
  }
  return items.map((item, index) => (
    <Fragment key={`${item.address}-${index}`}>
      {index > 0 && ', '}
      <AddressText value={item} full={full} className={className} />
    </Fragment>
  ));
};

export default AddressText;
