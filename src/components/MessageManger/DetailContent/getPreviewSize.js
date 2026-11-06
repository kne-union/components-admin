/** 计算 HTML 邮件预览 iframe 的尺寸。
 * 宽元素（固定宽表格/图片）会把 iframe 撑到内容真实宽度，由外层容器提供横向滚动条，
 * 避免邮件自带的 overflow:hidden 样式把内容裁掉；普通邮件则保持与容器同宽。
 * 高度需补上横向滚动条占用的高度，否则滚动条会把正文最后一行盖住。
 */
const MIN_HEIGHT = 60;

const getPreviewSize = ({ containerWidth = 0, contentWidth = 0, bodyHeight = 0, scrollbarHeight = 0 }) => ({
  width: Math.max(Math.ceil(containerWidth), Math.ceil(contentWidth), 1),
  height: Math.max(Math.ceil(bodyHeight + Math.max(scrollbarHeight, 0)), MIN_HEIGHT)
});

export default getPreviewSize;
