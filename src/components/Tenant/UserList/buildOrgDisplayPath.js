import getUserOrgDisplayItems from './getUserOrgDisplayItems';

const buildOrgDisplayPath = item => {
  const items = getUserOrgDisplayItems(item);
  if (items.length) {
    return items.map(org => org.fullPath || org.label).join('；');
  }
  return '';
};

export default buildOrgDisplayPath;
