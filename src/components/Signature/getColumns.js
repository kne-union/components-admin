const getColumns = () => {
  return [
    {
      name: 'appId',
      title: 'AppId',
      type: 'other'
    },
    {
      name: 'secretKey',
      title: 'SecretKey',
      type: 'other'
    },
    {
      name: 'user',
      title: '所属用户',
      type: 'other',
      valueOf: ({ user }) => {
        return user.nickname || user.email || user.phone;
      }
    },
    {
      name: 'description',
      title: '描述',
      type: 'description'
    },
    {
      name: 'lastVisitedAt',
      title: '最后访问时间',
      type: 'datetime'
    },
    {
      name: 'status',
      title: '状态',
      type: 'tag',
      valueOf: (item, { name }) => {
        if (item[name] === 0) {
          return { type: 'success', text: '启用' };
        }
        return { type: 'danger', text: '禁用' };
      }
    },
    {
      name: 'createdAt',
      title: '创建时间',
      type: 'datetime'
    }
  ];
};

export default getColumns;
