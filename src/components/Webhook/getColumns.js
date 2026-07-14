const getColumns = ({ renderCopyInvokeUrl, renderCopySignature }) => {
  return [
    {
      name: 'id',
      title: 'ID',
      renderType: 'id'
    },
    {
      name: 'name',
      title: '名称'
    },
    {
      name: 'url',
      title: '调用路径',
      renderType: 'small',
      getValueOf: item => {
        return renderCopyInvokeUrl(item);
      }
    },
    {
      name: 'signature',
      title: '签名',
      renderType: 'small',
      getValueOf: item => {
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
      getValueOf: item => {
        return item.shouldEncryptVerify ? '是' : '否';
      }
    }
  ];
};

export default getColumns;
