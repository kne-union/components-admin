const getColumns = () => {
  return [
    {
      name: 'id',
      title: 'ID',
      renderType: 'id'
    },
    {
      name: 'endTime',
      title: '结束时间',
      format: 'datetime'
    },
    {
      name: 'duration',
      title: '运行时间',
      getValueOf: item => {
        return `${new Date(item.endTime).getTime() - new Date(item.startTime).getTime()}ms`;
      }
    },
    {
      name: 'input',
      title: '调用参数',
      renderType: 'description',
      ellipsis: true,
      getValueOf: item => {
        return item.input && JSON.stringify(item.input);
      }
    },
    {
      name: 'status',
      title: '执行状态',
      renderType: 'tag',
      getValueOf: item => {
        if (item.status === 'success') {
          return { type: 'success', text: '成功' };
        }
        return { type: 'error', text: '失败' };
      }
    },
    {
      name: 'result',
      title: '执行结果',
      renderType: 'description',
      ellipsis: true,
      getValueOf: item => {
        return item.result && JSON.stringify(item.result);
      }
    }
  ];
};

export default getColumns;
