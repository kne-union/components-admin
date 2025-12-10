const getColumns = ({ renderCopyInvokeUrl, renderCopySignature }) => {
  return [
    {
      name: 'id',
      title: 'ID',
      type: 'serialNumber'
    },
    {
      name: 'name',
      title: '名称'
    },
    {
      name: 'url',
      title: '调用路径',
      type: 'otherSmall',
      valueOf: item => {
        return renderCopyInvokeUrl(item);
      }
    },
    {
      name: 'signature',
      title: '签名',
      type: 'otherSmall',
      valueOf: item => {
        return renderCopySignature(item);
      }
    },
    {
      name: 'signatureLocation',
      title: '签名位置'
    },
    {
      name: 'inputLocation',
      title: '输入位置'
    },
    {
      name: 'shouldEncryptVerify',
      title: '是否验证完整性',
      valueOf: item => {
        return item.shouldEncryptVerify ? '是' : '否';
      }
    }
  ];
};

export default getColumns;
