import {PageData} from '@models/Common';

export const preparePageData = (total:number, limit:number, offset?:number): PageData => {
  const current_offset = offset ? parseInt(offset.toString(), 10) : 0;
  const numLimit = parseInt(limit.toString(), 10);

  const page_data : PageData = {
    current_offset,
    total,
    limit: numLimit,
    next_offset: (current_offset + numLimit) < total ? (current_offset + numLimit) : -1,
    prev_offset: (current_offset - numLimit) >= 0 ? (current_offset - numLimit) : -1,
  };

  return page_data;
};
