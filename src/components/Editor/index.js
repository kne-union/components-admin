import { createWithRemoteLoader } from '@kne/remote-loader';

const Editor = createWithRemoteLoader({
  modules: ['components-thirdparty:CKEditor', 'components-core:Global@usePreset']
})(({ remoteModules, ...props }) => {
  const [Editor, usePreset] = remoteModules;
  const { apis } = usePreset();
  return <Editor {...props} uploadAdapter={{ upload: apis.file.uploadForEditor }} />;
});

export default Editor;
