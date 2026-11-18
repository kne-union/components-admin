/**
 * AdminLayout 等示例用的 fileManager mock（对齐 components-file-manager 包内 getApis + 列表 mock）
 */
import fileList from './file-list.json';

const prefix = '/api/v1/static';

const paginate = (list, currentPage = 1, perPage = 20) => {
  const totalCount = list.length;
  const page = Number(currentPage) || 1;
  const size = Number(perPage) || 20;
  const start = (page - 1) * size;
  return {
    pageData: list.slice(start, start + size),
    totalCount
  };
};

const filterFileList = ({ data } = {}) => {
  const { filter = {}, currentPage = 1, perPage = 20 } = Object.assign({}, data);
  let list = (fileList.data?.pageData || []).slice();

  if (filter.id) {
    const id = String(filter.id).toLowerCase();
    list = list.filter(item => String(item.id).toLowerCase().indexOf(id) > -1);
  }
  if (filter.filename) {
    const keyword = String(filter.filename).toLowerCase();
    list = list.filter(item => String(item.filename).toLowerCase().indexOf(keyword) > -1);
  }
  if (filter.namespace) {
    const namespace = String(filter.namespace).toLowerCase();
    list = list.filter(item => String(item.namespace).toLowerCase().indexOf(namespace) > -1);
  }
  if (Array.isArray(filter.size) && filter.size.length > 0) {
    const [minK, maxK] = filter.size;
    list = list.filter(item => {
      const sizeK = item.size / 1024;
      if (minK != null && minK !== '' && sizeK < Number(minK)) {
        return false;
      }
      if (maxK != null && maxK !== '' && sizeK > Number(maxK)) {
        return false;
      }
      return true;
    });
  }
  ['createdAt', 'updatedAt'].forEach(name => {
    if (!filter[name]) {
      return;
    }
    const { startTime, endTime } = filter[name];
    list = list.filter(item => {
      const value = item[name];
      if (!value) {
        return false;
      }
      if (startTime && value < startTime) {
        return false;
      }
      if (endTime && value > endTime) {
        return false;
      }
      return true;
    });
  });

  return paginate(list, currentPage, perPage);
};

const fileManagerUrls = {
  upload: { url: `${prefix}/upload`, method: 'POST' },
  getFileUrl: { url: `${prefix}/file-url/{id}`, method: 'GET' },
  getFile: { url: `${prefix}/file-id/{id}`, method: 'GET' },
  getThumbnails: { url: `${prefix}/thumbnails`, method: 'POST' },
  deleteFiles: { url: `${prefix}/delete-files`, method: 'POST' },
  replaceFile: { url: `${prefix}/replace-file`, method: 'POST' },
  renameFile: { url: `${prefix}/rename-file`, method: 'POST' },
  getFileList: { url: `${prefix}/file-list`, method: 'POST' },
  downloadFiles: { url: `${prefix}/download-files`, method: 'POST' },
  folderTree: { url: `${prefix}/folder/tree`, method: 'GET' },
  folderList: { url: `${prefix}/folder/list`, method: 'POST' },
  folderMkdir: { url: `${prefix}/folder/mkdir`, method: 'POST' },
  folderUpload: { url: `${prefix}/folder/upload`, method: 'POST' },
  folderRemove: { url: `${prefix}/folder/remove`, method: 'POST' },
  folderMove: { url: `${prefix}/folder/move`, method: 'POST' },
  folderCopy: { url: `${prefix}/folder/copy`, method: 'POST' },
  folderRename: { url: `${prefix}/folder/rename`, method: 'POST' },
  folderAddFiles: { url: `${prefix}/folder/add-files`, method: 'POST' }
};

const fileManagerMock = Object.assign({}, fileManagerUrls, {
  getFileList: Object.assign({}, fileManagerUrls.getFileList, {
    loader: props => filterFileList(props)
  }),
  deleteFiles: Object.assign({}, fileManagerUrls.deleteFiles, {
    loader: () => ({ success: true })
  }),
  renameFile: Object.assign({}, fileManagerUrls.renameFile, {
    loader: ({ data }) => ({
      id: data?.id,
      filename: data?.filename
    })
  }),
  replaceFile: Object.assign({}, fileManagerUrls.replaceFile, {
    loader: () => ({ success: true })
  }),
  upload: Object.assign({}, fileManagerUrls.upload, {
    loader: () => ({
      id: `upload-${Date.now()}`,
      filename: '新上传文件.pdf',
      size: 102400,
      namespace: 'upload',
      mimetype: 'application/pdf'
    })
  }),
  getFile: Object.assign({}, fileManagerUrls.getFile, {
    loader: ({ urlParams }) => {
      const id = urlParams?.id;
      const item = (fileList.data?.pageData || []).find(file => file.id === id);
      return item || fileList.data.pageData[0];
    }
  }),
  getFileUrl: Object.assign({}, fileManagerUrls.getFileUrl, {
    loader: ({ urlParams }) => {
      const id = urlParams?.id || 'demo';
      return { url: `${prefix}/file-id/${id}` };
    }
  }),
  getThumbnails: Object.assign({}, fileManagerUrls.getThumbnails, {
    loader: () => ({})
  }),
  downloadFiles: Object.assign({}, fileManagerUrls.downloadFiles, {
    loader: () => ({ success: true })
  }),
  folderTree: Object.assign({}, fileManagerUrls.folderTree, {
    loader: () => []
  }),
  folderList: Object.assign({}, fileManagerUrls.folderList, {
    loader: () => ({ pageData: [], totalCount: 0 })
  }),
  folderAddFiles: Object.assign({}, fileManagerUrls.folderAddFiles, {
    loader: () => []
  })
});

export default fileManagerMock;
export { fileList, filterFileList };
