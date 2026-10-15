import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useEffect, useState } from 'react';
import { App, Button, Divider, Flex, Tag, Typography } from 'antd';
import {
  CloudDownloadOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  MailOutlined,
  PaperClipOutlined,
  RollbackOutlined,
  ShareAltOutlined,
  StarFilled,
  StarOutlined,
  TagsOutlined,
  TeamOutlined,
  UndoOutlined
} from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import HtmlPreview from '@components/MessageManger/DetailContent/HtmlPreview';
import withLocale from '../withLocale';
import { LabelSelectField } from '../fields';
import { useOpenCompose } from './Compose';
import { formatSize } from '../utils';
import { AddressList } from '../Contact/AddressText';
import style from '../style.module.scss';

const AttachmentItem = createWithRemoteLoader({
  modules: ['components-core:File@useFileModal', 'components-core:Global@usePreset']
})(({ remoteModules, mailId, index, attachment, onDownloaded }) => {
  const [useFileModal, usePreset] = remoteModules;
  const { ajax, apis } = usePreset();
  const { formatMessage } = useIntl();
  const [downloading, setDownloading] = useState(false);
  const [previewPending, setPreviewPending] = useState(false);
  const ready = !!(attachment.id || attachment.url);
  const openPreview = useFileModal({ id: attachment.id, src: attachment.url, filename: attachment.filename, openDownload: true });

  useEffect(() => {
    if (previewPending && ready) {
      setPreviewPending(false);
      openPreview();
    }
  }, [previewPending, ready, openPreview]);

  const handleClick = async () => {
    if (ready) {
      openPreview();
      return;
    }
    setDownloading(true);
    try {
      const { data: resData } = await ajax(Object.assign({}, apis.mailGateway.mail.downloadAttachment, { urlParams: { id: mailId, index } }));
      if (resData.code !== 0) {
        return;
      }
      onDownloaded(index, resData.data);
      setPreviewPending(true);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Flex gap={8} align="center" wrap="wrap">
      <Button
        type="link"
        className="btn-no-padding"
        icon={ready ? <PaperClipOutlined /> : <CloudDownloadOutlined />}
        loading={downloading}
        title={ready ? undefined : formatMessage({ id: 'AttachmentDownloadTips' })}
        onClick={handleClick}
      >
        {attachment.filename}
      </Button>
      <Typography.Text type="secondary">{downloading ? formatMessage({ id: 'AttachmentDownloading' }) : formatSize(attachment.size)}</Typography.Text>
    </Flex>
  );
});

const MailDetailContent = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset', 'components-core:ButtonGroup', 'components-core:LoadingButton']
})(
  withLocale(({ remoteModules, data: mail, reload, accountAddress, onChange, onClose }) => {
    const [FormInfo, usePreset, ButtonGroup, LoadingButton] = remoteModules;
    const { ajax, apis } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    const openCompose = useOpenCompose({ FormInfo, usePreset });
    const formModal = FormInfo.useFormModal();
    const mailApis = apis.mailGateway.mail;
    const [attachments, setAttachments] = useState(mail.attachments || []);

    useEffect(() => {
      setAttachments(mail.attachments || []);
    }, [mail]);

    const onAttachmentDownloaded = (index, attachment) => {
      setAttachments(list => list.map((item, i) => (i === index ? Object.assign({}, item, attachment) : item)));
    };

    const request = async (api, { close, reloadDetail = true } = {}) => {
      const { data: resData } = await ajax(api);
      if (resData.code !== 0) {
        return false;
      }
      message.success(formatMessage({ id: 'OperationSuccess' }));
      onChange && onChange();
      if (close) {
        onClose && onClose();
      } else if (reloadDetail) {
        reload();
      }
    };

    const ids = [mail.id];
    const isTrash = mail.folder === 'trash';
    const isDraft = mail.folder === 'draft';
    const compose = mode => openCompose({ mode, mail: Object.assign({}, mail, { attachments }), accountAddress, onSuccess: onChange });

    const openSetLabels = () =>
      formModal({
        title: formatMessage({ id: 'SetLabels' }),
        size: 'small',
        formProps: {
          data: { labelIds: (mail.labels || []).map(item => item.id) },
          onSubmit: formData =>
            request(Object.assign({}, mailApis.setLabels, { urlParams: { id: mail.id }, data: { labelIds: formData.labelIds || [] } }))
        },
        children: (
          <FormInfo column={1} list={[<LabelSelectField name="labelIds" label={formatMessage({ id: 'Label' })} accountId={mail.accountId} />]} />
        )
      });

    const actionList = isDraft
      ? [
          { type: 'primary', icon: <EditOutlined />, children: formatMessage({ id: 'EditDraft' }), onClick: () => compose('draft') },
          {
            isDelete: true,
            icon: <DeleteOutlined />,
            message: formatMessage({ id: 'ConfirmRemoveDraft' }),
            children: formatMessage({ id: 'Delete' }),
            onClick: () => request(Object.assign({}, apis.mailGateway.draft.remove, { urlParams: { id: mail.id } }), { close: true })
          }
        ]
      : isTrash
        ? [
            {
              type: 'primary',
              buttonComponent: LoadingButton,
              icon: <UndoOutlined />,
              children: formatMessage({ id: 'Restore' }),
              onClick: () => request(Object.assign({}, mailApis.restore, { data: { ids } }), { close: true })
            },
            {
              isDelete: true,
              message: formatMessage({ id: 'ConfirmRemoveMail' }),
              icon: <DeleteOutlined />,
              children: formatMessage({ id: 'RemoveForever' }),
              onClick: () => request(Object.assign({}, mailApis.remove, { data: { ids } }), { close: true })
            }
          ]
        : [
            { type: 'primary', icon: <RollbackOutlined />, children: formatMessage({ id: 'Reply' }), onClick: () => compose('reply') },
            { icon: <TeamOutlined />, children: formatMessage({ id: 'ReplyAll' }), onClick: () => compose('replyAll') },
            { icon: <ShareAltOutlined />, children: formatMessage({ id: 'Forward' }), onClick: () => compose('forward') },
            { icon: <TagsOutlined />, children: formatMessage({ id: 'SetLabels' }), onClick: openSetLabels },
            {
              buttonComponent: LoadingButton,
              icon: mail.isStarred ? <StarFilled /> : <StarOutlined />,
              children: formatMessage({ id: mail.isStarred ? 'Unstar' : 'Star' }),
              onClick: () => request(Object.assign({}, mailApis.star, { data: { ids, isStarred: !mail.isStarred } }))
            },
            {
              buttonComponent: LoadingButton,
              icon: <MailOutlined />,
              children: formatMessage({ id: 'MarkUnread' }),
              onClick: () => request(Object.assign({}, mailApis.read, { data: { ids, isRead: false } }), { close: true })
            },
            {
              buttonComponent: LoadingButton,
              danger: true,
              icon: <DeleteOutlined />,
              children: formatMessage({ id: 'MoveToTrash' }),
              onClick: () => request(Object.assign({}, mailApis.trash, { data: { ids } }), { close: true })
            }
          ];

    return (
      <Flex vertical gap={16} className={style['mail-detail']}>
        <Flex vertical gap={8}>
          <Typography.Title level={5} className={style['mail-detail-subject']}>
            {mail.subject || formatMessage({ id: 'NoSubject' })}
          </Typography.Title>
          {(mail.labels || []).length > 0 && (
            <Flex gap={4} wrap="wrap">
              {mail.labels.map(label => (
                <Tag key={label.id} color={label.color}>
                  {label.name}
                </Tag>
              ))}
            </Flex>
          )}
          <div className={style['mail-detail-meta']}>
            <div>
              <span className={style['meta-label']}>{formatMessage({ id: 'From' })}</span>
              <AddressList list={mail.from} full />
            </div>
            <div>
              <span className={style['meta-label']}>{formatMessage({ id: 'To' })}</span>
              <AddressList list={mail.to} full />
            </div>
            {(mail.cc || []).length > 0 && (
              <div>
                <span className={style['meta-label']}>{formatMessage({ id: 'Cc' })}</span>
                <AddressList list={mail.cc} full />
              </div>
            )}
            {mail.date && (
              <div>
                <span className={style['meta-label']}>{formatMessage({ id: 'Date' })}</span>
                {new Date(mail.date).toLocaleString()}
              </div>
            )}
          </div>
        </Flex>
        <ButtonGroup
          list={actionList.map(item =>
            item.type ? item : Object.assign({ color: item.danger || item.isDelete ? 'danger' : 'default', variant: 'filled' }, item)
          )}
          more={
            <Button color="default" variant="filled">
              {formatMessage({ id: 'More' })}
              <DownOutlined />
            </Button>
          }
        />
        {attachments.length > 0 && (
          <Flex vertical gap={4} className={style['mail-detail-attachments']}>
            <Typography.Text type="secondary">{formatMessage({ id: 'AttachmentCount' }, { count: attachments.length })}</Typography.Text>
            {attachments.map((item, index) => (
              <AttachmentItem key={index} mailId={mail.id} index={index} attachment={item} onDownloaded={onAttachmentDownloaded} />
            ))}
          </Flex>
        )}
        <Divider className={style['mail-detail-divider']} />
        {mail.html ? <HtmlPreview html={mail.html} /> : <pre className={style['mail-detail-text']}>{mail.text}</pre>}
      </Flex>
    );
  })
);

const MailDetail = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, id, ...props }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  return (
    <Fetch
      {...Object.assign({}, apis.mailGateway.mail.detail, { urlParams: { id } })}
      render={({ data, reload }) => (data ? <MailDetailContent {...props} data={data} reload={reload} /> : null)}
    />
  );
});

export default MailDetail;
