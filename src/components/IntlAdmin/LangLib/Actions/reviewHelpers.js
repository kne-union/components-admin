import merge from 'lodash/merge';
import enums from '../../enums';

export const getLeafEntries = (rows = []) => rows.filter(row => row?.locale);

export const getPendingEntries = (rows = []) => getLeafEntries(rows).filter(row => row.reviewStatus === 'pending');

const REVIEW_OPTIONS = (enums.reviewStatus || [])
  .filter(item => item.value !== 'pending')
  .map(item => ({
    label: item.description,
    value: item.value
  }));

/** SuperSelect object-output-value 回显需要对象，不能只传 value 字符串 */
export const getDefaultReviewFormData = () => {
  const approved = REVIEW_OPTIONS.find(item => item.value === 'approved') || {
    value: 'approved',
    label: '已通过'
  };
  return {
    reviewStatus: { value: approved.value, label: approved.label }
  };
};

export const buildReviewFormList = ({ FormInfo, formatMessage }) => {
  const { SuperSelect, TextArea } = FormInfo.fields;
  return [
    <SuperSelect
      name="reviewStatus"
      label={formatMessage({ id: 'ReviewResult' })}
      rule="REQ"
      single
      isPopup
      interceptor="object-output-value"
      options={REVIEW_OPTIONS}
    />,
    <TextArea name="reviewRemark" label={formatMessage({ id: 'ReviewRemark' })} rule="LEN-0-500" />
  ];
};

export const requestReview = async ({ ajax, apis, ids, formData }) => {
  const idList = Array.isArray(ids) ? ids : [ids];
  const { data: resData } = await ajax(
    typeof apis.review === 'function'
      ? apis.review({ formData, ids: idList })
      : merge({}, apis.review, {
          data: Object.assign({}, formData, idList.length === 1 ? { id: idList[0] } : { ids: idList })
        })
  );
  return resData;
};

export const requestRemove = async ({ ajax, apis, ids }) => {
  const idList = Array.isArray(ids) ? ids : [ids];
  const { data: resData } = await ajax(
    typeof apis.remove === 'function'
      ? apis.remove({ ids: idList })
      : merge({}, apis.remove, {
          data: idList.length === 1 ? { id: idList[0] } : { ids: idList }
        })
  );
  return resData;
};

export const requestSetStatus = async ({ ajax, apis, ids, status }) => {
  const idList = Array.isArray(ids) ? ids : [ids];
  const { data: resData } = await ajax(
    typeof apis.setStatus === 'function'
      ? apis.setStatus({ ids: idList, status })
      : merge({}, apis.setStatus, {
          data: Object.assign(
            { status },
            idList.length === 1 ? { id: idList[0] } : { ids: idList }
          )
        })
  );
  return resData;
};

export const requestCopyToNamespace = async ({ ajax, apis, ids, namespace }) => {
  const idList = Array.isArray(ids) ? ids : [ids];
  const { data: resData } = await ajax(
    typeof apis.copyToNamespace === 'function'
      ? apis.copyToNamespace({ ids: idList, namespace })
      : merge({}, apis.copyToNamespace, {
          data: Object.assign(
            { namespace },
            idList.length === 1 ? { id: idList[0] } : { ids: idList }
          )
        })
  );
  return resData;
};
