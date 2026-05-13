import { useLocation } from 'react-router-dom';
import AppChildrenRouter from '@kne/app-children-router';
import MyTask from './MyTask';
import AllTask from './AllTask';
import Dashboard from './Dashboard';

const Task = ({ baseUrl, getManualTaskAction, children, ...props }) => {
  const location = useLocation();
  return (
    <AppChildrenRouter
      list={[
        {
          index: true,
          element: <Dashboard {...props} baseUrl={baseUrl} />
        },
        {
          path: 'my',
          element: <MyTask {...props} baseUrl={baseUrl} getManualTaskAction={getManualTaskAction} />
        },
        {
          path: 'all',
          element: <AllTask {...props} baseUrl={baseUrl} getManualTaskAction={getManualTaskAction} />
        }
      ]}>
      {children}
    </AppChildrenRouter>
  );
};

export default Task;

export { default as enums } from './enums';
export { default as Actions } from './Actions';
export { default as getColumns, ColumnsLoader } from './getColumns';
export { MyTask, AllTask, Dashboard };
