import { globalInit } from '../preset';
import { getApis } from '@components/Apis';
import { enums } from '@components/Task';
import merge from 'lodash/merge';

import taskList from './task-list.json';

export { taskList };

const apis = merge({}, getApis(), {
  task: {
    list: {
      loader: () => {
        return import('./task-list.json').then(({ default: data }) => data.data);
      }
    },
    cancel: {
      loader: () => {
        return { code: 0, data: { success: true } };
      }
    },
    retry: {
      loader: () => {
        return { code: 0, data: { success: true } };
      }
    }
  }
});

const preset = {
  ajax: async ({ loader, ...props }) => {
    if (!loader && props.url) {
      const { ajax } = await globalInit();
      return ajax({ loader, ...props });
    }
    return Promise.resolve({ data: loader ? { code: 0, data: loader() } : { code: 0, data: {} } });
  },
  apis,
  enums: Object.assign({}, enums, {
    taskType: [
      { value: 'interview_report', description: '面试报告' },
      { value: 'data_export', description: '数据导出' },
      { value: 'email_notification', description: '邮件通知' },
      { value: 'video_processing', description: '视频处理' },
      { value: 'data_sync', description: '数据同步' },
      { value: 'report_generation', description: '报表生成' }
    ]
  })
};

export default preset;
