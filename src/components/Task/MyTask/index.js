import { createWithRemoteLoader } from '@kne/remote-loader';
import Menu from '../Menu';
import getColumns from '../getColumns';
import { useRef } from 'react';
import Actions from '../Actions';

const MyTask = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Global@usePreset']
})(({ remoteModules, baseUrl, getManualTaskAction }) => {
  const [TablePage, usePreset] = remoteModules;
  const { apis } = usePreset();
  const ref = useRef(null);

  return (
    <TablePage
      {...Object.assign({}, apis.task.list, {
        params: {
          filter: {
            status: 'pending',
            runnerType: 'manual'
          }
        }
      })}
      ref={ref}
      pagination={{ paramsType: 'params' }}
      name="admin-task-my-list"
      columns={[
        ...getColumns(),
        {
          name: 'options',
          title: '操作',
          type: 'options',
          fixed: 'right',
          valueOf: item => {
            return {
              children: (
                <Actions
                  type="link"
                  data={item}
                  getManualTaskAction={getManualTaskAction}
                  onSuccess={() => {
                    ref.current.reload();
                  }}
                />
              )
            };
          }
        }
      ]}
      page={{
        menu: <Menu baseUrl={baseUrl} />
      }}
    />
  );
});

export default MyTask;
