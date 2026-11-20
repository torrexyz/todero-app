export const normalizeById = (rows = []) =>
  Object.fromEntries(rows.map(({ public_id, ...data }) => [public_id, data]));
