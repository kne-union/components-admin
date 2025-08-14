import { Routes, Route } from 'react-router-dom';
import MyTask from './MyTask';
import AllTask from './AllTask';

const Task = ({ baseUrl, getManualTaskAction }) => {
  return (
    <Routes>
      <Route index element={<MyTask baseUrl={baseUrl} getManualTaskAction={getManualTaskAction} />} />
      <Route path="all" element={<AllTask baseUrl={baseUrl} getManualTaskAction={getManualTaskAction} />} />
    </Routes>
  );
};

export default Task;

export { default as enums } from './enums';
export { default as Actions } from './Actions';
export { default as getColumns } from './getColumns';
