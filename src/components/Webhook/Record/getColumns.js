const getColumns = () => {
  return [
    {
      name: 'id',
      title: 'ID',
      type: 'serialNumber'
    },
    {
      name: 'endTime',
      title: '结束时间',
      type: 'datetime'
    },
    {
      name: 'duration',
      title: '运行时间',
      valueOf: item => {
        return `${new Date(item.endTime).getTime() - new Date(item.startTime).getTime()}ms`;
      }
    },
    {
      name: 'input',
      title: '调用参数',
      valueOf: item => {
        return item.input && JSON.stringify(item.input);
      }
    },
    {
      name: 'status',
      title: '执行状态',
      type: 'tag',
      valueOf: item => {
        if (item.status === 'success') {
          return { type: 'success', text: '成功' };
        }
        return { type: 'error', text: '失败' };
      }
    },
    {
      name: 'result',
      title: '执行结果',
      valueOf: item => {
        return item.result && JSON.stringify(item.result);
      }
    }
  ];
};

export default getColumns;
