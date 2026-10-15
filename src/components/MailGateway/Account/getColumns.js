const getColumns = ({ formatMessage }) => [
  { name: 'name', title: formatMessage({ id: 'AccountName' }), width: 140, renderType: 'main' },
  { name: 'address', title: formatMessage({ id: 'AccountAddress' }), width: 220, ellipsis: true },
  {
    name: 'imap',
    title: 'IMAP',
    width: 200,
    ellipsis: true,
    getValueOf: item => (item.imap ? `${item.imap.host}:${item.imap.port}` : '-')
  },
  {
    name: 'smtp',
    title: 'SMTP',
    width: 200,
    ellipsis: true,
    getValueOf: item => (item.smtp ? `${item.smtp.host}:${item.smtp.port}` : '-')
  },
  { name: 'status', title: formatMessage({ id: 'Status' }), width: 100, renderType: 'enum', moduleName: 'mailAccountStatus' },
  { name: 'lastSyncAt', title: formatMessage({ id: 'LastSyncAt' }), width: 170, format: 'datetime' },
  { name: 'lastError', title: formatMessage({ id: 'LastError' }), renderType: 'description', ellipsis: true }
];

export default getColumns;
