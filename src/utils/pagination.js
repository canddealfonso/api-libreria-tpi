function parseIntOr(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function parsePagination(query, { defaultPage = 1, defaultLimit = 10, maxLimit = 50 } = {}) {
  const page = clamp(parseIntOr(query.page, defaultPage), 1, 10_000);
  const limit = clamp(parseIntOr(query.limit, defaultLimit), 1, maxLimit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * sort=createdAt      -> { createdAt: 1 }
 * sort=-createdAt     -> { createdAt: -1 }
 * sort=titulo,-anio   -> { titulo: 1, anio: -1 }
 */
function parseSort(sortParam, { defaultSort = { createdAt: -1 } } = {}) {
  if (!sortParam) return defaultSort;
  const fields = String(sortParam).split(",").map((s) => s.trim()).filter(Boolean);
  if (fields.length === 0) return defaultSort;

  const sort = {};
  for (const f of fields) {
    if (f.startsWith("-")) sort[f.slice(1)] = -1;
    else sort[f] = 1;
  }
  return sort;
}

module.exports = { parsePagination, parseSort };
