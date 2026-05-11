import AppChildrenRouter from '@kne/app-children-router';
import Dashboard from './Dashboard';
import MessageList from './MessageList';
import DeadLetterList from './DeadLetterList';
import TraceList from './TraceList';
import QueueTools from './QueueTools';

const MessageQueue = ({ baseUrl, children, ...props }) => {
  return (
    <AppChildrenRouter
      list={[
        {
          index: true,
          element: <Dashboard {...props} baseUrl={baseUrl} />
        },
        {
          path: 'messages',
          element: <MessageList {...props} baseUrl={baseUrl} />
        },
        {
          path: 'dead-letter',
          element: <DeadLetterList {...props} baseUrl={baseUrl} />
        },
        {
          path: 'traces',
          element: <TraceList {...props} baseUrl={baseUrl} />
        },
        {
          path: 'tools',
          element: <QueueTools {...props} baseUrl={baseUrl} />
        }
      ]}>
      {children}
    </AppChildrenRouter>
  );
};

export default MessageQueue;

export { default as enums } from './enums';
export { default as getColumns, ColumnsLoader } from './getColumns';
export { default as getDeadLetterColumns, DeadLetterColumnsLoader } from './getDeadLetterColumns';
export { default as getTraceColumns, TraceColumnsLoader } from './getTraceColumns';
export { default as Actions } from './Actions';
export { default as DeadLetterActions } from './Actions/DeadLetterActions';
export { default as Dashboard } from './Dashboard';
export { default as PublishMessage } from './PublishMessage';
export { default as QueueTools } from './QueueTools';
export { MessageList, DeadLetterList, TraceList };
