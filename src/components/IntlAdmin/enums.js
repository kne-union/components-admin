const REVIEW_STATUS_ENUM = [
  { value: 'approved', description: '已通过' },
  { value: 'pending', description: '待审核' },
  { value: 'rejected', description: '已拒绝' }
];

const enums = { reviewStatus: REVIEW_STATUS_ENUM };

export default enums;
