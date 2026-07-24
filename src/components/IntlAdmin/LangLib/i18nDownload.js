const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
})();

const crc32 = bytes => {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
};

const writeUint16 = (view, offset, value) => {
  view.setUint16(offset, value, true);
};

const writeUint32 = (view, offset, value) => {
  view.setUint32(offset, value, true);
};

/**
 * 生成无压缩（STORE）ZIP，用于多文件 .i18n 打包下载。
 * @param {Array<{ filename: string, content: string }>} files
 * @returns {Blob}
 */
export const createStoreZipBlob = (files = []) => {
  const encoder = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;

  files.forEach(file => {
    const nameBytes = encoder.encode(file.filename);
    const dataBytes = encoder.encode(file.content == null ? '' : file.content);
    const checksum = crc32(dataBytes);
    const local = new Uint8Array(30 + nameBytes.length + dataBytes.length);
    const localView = new DataView(local.buffer);
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 8, 0); // method STORE
    writeUint32(localView, 14, checksum);
    writeUint32(localView, 18, dataBytes.length);
    writeUint32(localView, 22, dataBytes.length);
    writeUint16(localView, 26, nameBytes.length);
    local.set(nameBytes, 30);
    local.set(dataBytes, 30 + nameBytes.length);
    parts.push(local);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 10, 0);
    writeUint32(centralView, 16, checksum);
    writeUint32(centralView, 20, dataBytes.length);
    writeUint32(centralView, 24, dataBytes.length);
    writeUint16(centralView, 28, nameBytes.length);
    writeUint32(centralView, 42, offset);
    centralHeader.set(nameBytes, 46);
    central.push(centralHeader);

    offset += local.length;
  });

  const centralSize = central.reduce((sum, item) => sum + item.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 8, files.length);
  writeUint16(endView, 10, files.length);
  writeUint32(endView, 12, centralSize);
  writeUint32(endView, 16, offset);

  return new Blob([...parts, ...central, end], { type: 'application/zip' });
};

export const triggerBlobDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadI18nFiles = (files = []) => {
  if (!Array.isArray(files) || files.length === 0) {
    return false;
  }
  if (files.length === 1) {
    const file = files[0];
    triggerBlobDownload(new Blob([file.content || ''], { type: 'text/plain;charset=utf-8' }), file.filename);
    return true;
  }
  triggerBlobDownload(createStoreZipBlob(files), 'lang-lib-export.zip');
  return true;
};

const basename = name =>
  String(name || '')
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .pop() || '';

const isI18nFilename = name => /\.i18n$/i.test(basename(name));

const inflateRaw = async compressed => {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('当前环境不支持解压 ZIP（缺少 DecompressionStream）');
  }
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
};

/**
 * 解析 ZIP（支持 STORE / DEFLATE），提取其中的 .i18n 文本文件。
 * @param {ArrayBuffer|Uint8Array} buffer
 * @returns {Promise<Array<{ filename: string, content: string }>>}
 */
export const extractI18nFilesFromZip = async buffer => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder('utf-8');
  const files = [];
  let offset = 0;

  while (offset + 4 <= bytes.length) {
    const signature = view.getUint32(offset, true);
    if (signature !== 0x04034b50) {
      break;
    }
    if (offset + 30 > bytes.length) {
      throw new Error('ZIP 文件损坏');
    }

    const flags = view.getUint16(offset + 6, true);
    const method = view.getUint16(offset + 8, true);
    let compressedSize = view.getUint32(offset + 18, true);
    let uncompressedSize = view.getUint32(offset + 22, true);
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const nameEnd = nameStart + nameLen;
    const dataStart = nameEnd + extraLen;

    if (nameEnd > bytes.length) {
      throw new Error('ZIP 文件损坏');
    }

    const rawName = decoder.decode(bytes.subarray(nameStart, nameEnd));
    const filename = basename(rawName);

    // bit3: data descriptor，本地头尺寸可能为 0，需从描述符读取
    if (flags & 0x08) {
      // 无法可靠从前向扫描长度时，尝试用中央目录；此处简化：不支持仅带 data descriptor 且尺寸为 0 的条目
      if (compressedSize === 0) {
        throw new Error(`ZIP 条目不支持（data descriptor）: ${rawName || filename}`);
      }
    }

    const dataEnd = dataStart + compressedSize;
    if (dataEnd > bytes.length) {
      throw new Error('ZIP 文件损坏');
    }

    const compressed = bytes.subarray(dataStart, dataEnd);
    offset = dataEnd;
    if (flags & 0x08) {
      // data descriptor: optional signature + crc + sizes (12 or 16 bytes)
      if (offset + 4 <= bytes.length && view.getUint32(offset, true) === 0x08074b50) {
        offset += 16;
      } else {
        offset += 12;
      }
    }

    if (!filename || rawName.endsWith('/') || !isI18nFilename(filename)) {
      continue;
    }
    if (filename.startsWith('.') || rawName.includes('__MACOSX/')) {
      continue;
    }

    let contentBytes;
    if (method === 0) {
      contentBytes = compressed;
    } else if (method === 8) {
      contentBytes = await inflateRaw(compressed);
      if (uncompressedSize && contentBytes.length !== uncompressedSize) {
        // 允许轻微差异，仍使用解压结果
      }
    } else {
      throw new Error(`不支持的 ZIP 压缩方式(${method}): ${filename}`);
    }

    files.push({
      filename,
      content: decoder.decode(contentBytes)
    });
  }

  return files;
};

/**
 * 将用户选择的 File 列表转为导入用的 [{ filename, content }]
 * 支持 .i18n 与包含 .i18n 的 .zip
 * @param {File[]} fileList
 * @returns {Promise<Array<{ filename: string, content: string }>>}
 */
export const readImportFiles = async (fileList = []) => {
  const result = [];
  for (const file of fileList) {
    const name = file.name || '';
    if (/\.zip$/i.test(name)) {
      const buffer = await file.arrayBuffer();
      const extracted = await extractI18nFilesFromZip(buffer);
      if (extracted.length === 0) {
        throw new Error(`ZIP 中未找到 .i18n 文件: ${name}`);
      }
      result.push(...extracted);
      continue;
    }
    if (/\.i18n$/i.test(name)) {
      result.push({
        filename: basename(name),
        content: await file.text()
      });
      continue;
    }
    throw new Error(`不支持的文件类型: ${name}`);
  }
  return result;
};
