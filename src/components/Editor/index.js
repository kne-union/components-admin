import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo } from 'react';

const Editor = createWithRemoteLoader({
  modules: ['components-thirdparty:CKEditor', 'components-core:Global@usePreset']
})(({ remoteModules, ...props }) => {
  const [Editor, usePreset] = remoteModules;
  const { apis } = usePreset();
  const uploadAdapter = useMemo(() => {
    return { upload: apis?.file?.uploadForEditor };
  }, [apis?.file?.uploadForEditor]);
  return <Editor {...props} uploadAdapter={uploadAdapter} />;
});

export default Editor;
