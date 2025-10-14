import { createWithRemoteLoader } from '@kne/remote-loader';
import Menu from '../Menu';
import { useRef } from 'react';
import getColumns from '../getColumns';
import Actions from '../Actions';

const AllTask = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Global@usePreset']
})(({ remoteModules, baseUrl, getManualTaskAction }) => {
  const [TablePage, usePreset] = remoteModules;
  const { apis } = usePreset();
  const ref = useRef(null);

  return (
    <TablePage
      {...apis.task.list}
      ref={ref}
      pagination={{ paramsType: 'params' }}
      name="admin-task-all-list"
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
                  getManualTaskAction={getManualTaskAction}
                  data={item}
                  type="link"
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

export default AllTask;
