const getColumns = () => {
  return [
    {
      name: 'id',
      title: 'ID',
      type: 'serialNumber',
      primary: false,
      hover: false
    },
    {
      name: 'avatar',
      title: '头像',
      type: 'avatar',
      valueOf: (item, { name }) => Object.assign({}, { id: item[name] })
    },
    {
      name: 'name',
      title: '姓名',
      type: 'mainInfo',
      primary: false,
      hover: false
    },
    {
      name: 'phone',
      title: '电话',
      type: 'other'
    },
    {
      name: 'email',
      title: '邮箱',
      type: 'other'
    },
    {
      name: 'roles',
      title: '角色',
      valueOf: item => {
        return item.roles.map(item => item.name).join(',') || '默认角色';
      }
    },
    {
      name: 'tenantOrg',
      title: '部门',
      valueOf: item => {
        return item.tenantOrg?.name;
      }
    },
    {
      name: 'description',
      type: 'description',
      title: '描述',
      ellipsis: true
    }
  ];
};

export default getColumns;
