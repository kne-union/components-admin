import { useEffect } from 'react';

const SyncOrgList = ({ list, onChange }) => {
  useEffect(() => {
    onChange(list);
  }, [list, onChange]);

  return null;
};

export default SyncOrgList;
