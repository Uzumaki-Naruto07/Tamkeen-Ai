// Array filtering
export const filterArray = (array, predicate) => {
  return array.filter(predicate);
};

// Array mapping
export const mapArray = (array, mapper) => {
  return array.map(mapper);
};

// Array reduction
export const reduceArray = (array, reducer, initialValue) => {
  return array.reduce(reducer, initialValue);
};

// Array sorting
export const sortArray = (array, options = {}) => {
  const {
    key,
    order = 'asc',
    type = 'string',
  } = options;
  
  return [...array].sort((a, b) => {
    let valueA = key ? a[key] : a;
    let valueB = key ? b[key] : b;
    
    if (type === 'number') {
      valueA = Number(valueA);
      valueB = Number(valueB);
    } else if (type === 'date') {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }
    
    if (order === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
};

// Array grouping
export const groupArray = (array, key) => {
  return array.reduce((groups, item) => {
    const groupKey = item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
};

// Array chunking
export const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Array flattening
export const flattenArray = (array, depth = Infinity) => {
  return array.flat(depth);
};

// Array unique values
export const uniqueArray = (array) => {
  return [...new Set(array)];
};

// Array intersection
export const intersectArrays = (array1, array2) => {
  return array1.filter((item) => array2.includes(item));
};

// Array union
export const unionArrays = (array1, array2) => {
  return [...new Set([...array1, ...array2])];
};

// Array difference
export const differenceArrays = (array1, array2) => {
  return array1.filter((item) => !array2.includes(item));
};

// Array symmetric difference
export const symmetricDifferenceArrays = (array1, array2) => {
  return array1
    .filter((item) => !array2.includes(item))
    .concat(array2.filter((item) => !array1.includes(item)));
};

// Array shuffling
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Array sampling
export const sampleArray = (array, size = 1) => {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, size);
};

// Array pagination
export const paginateArray = (array, page, pageSize) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: array.slice(start, end),
    total: array.length,
    page,
    pageSize,
    totalPages: Math.ceil(array.length / pageSize),
  };
};

// Array searching
export const searchArray = (array, query, options = {}) => {
  const {
    keys = [],
    caseSensitive = false,
    exact = false,
  } = options;
  
  const searchQuery = caseSensitive ? query : query.toLowerCase();
  
  return array.filter((item) => {
    if (keys.length === 0) {
      const value = String(item);
      return exact
        ? value === searchQuery
        : value.toLowerCase().includes(searchQuery);
    }
    
    return keys.some((key) => {
      const value = String(item[key]);
      return exact
        ? value === searchQuery
        : value.toLowerCase().includes(searchQuery);
    });
  });
};

// Array validation
export const validateArray = (array, rules) => {
  const errors = [];
  
  rules.forEach((rule) => {
    if (rule.required && array.length === 0) {
      errors.push('Array is required');
    } else if (rule.minLength && array.length < rule.minLength) {
      errors.push(`Array must have at least ${rule.minLength} items`);
    } else if (rule.maxLength && array.length > rule.maxLength) {
      errors.push(`Array must have at most ${rule.maxLength} items`);
    } else if (rule.validate) {
      const error = rule.validate(array);
      if (error) {
        errors.push(error);
      }
    }
  });
  
  return errors;
};

// Array transformation
export const transformArray = (array, transformations) => {
  return array.map((item) => {
    const transformed = { ...item };
    
    transformations.forEach((transform) => {
      const { key, transform: transformFn } = transform;
      if (key in transformed) {
        transformed[key] = transformFn(transformed[key]);
      }
    });
    
    return transformed;
  });
};

// Array aggregation
export const aggregateArray = (array, key, operations) => {
  return array.reduce((acc, item) => {
    const groupKey = item[key];
    if (!acc[groupKey]) {
      acc[groupKey] = {};
    }
    
    operations.forEach((operation) => {
      const { name, fn } = operation;
      if (!acc[groupKey][name]) {
        acc[groupKey][name] = [];
      }
      acc[groupKey][name].push(fn(item));
    });
    
    return acc;
  }, {});
};

// Array manipulation
export const manipulateArray = (array, operations) => {
  let result = [...array];
  
  operations.forEach((operation) => {
    switch (operation.type) {
      case 'filter':
        result = filterArray(result, operation.predicate);
        break;
      case 'map':
        result = mapArray(result, operation.mapper);
        break;
      case 'sort':
        result = sortArray(result, operation.options);
        break;
      case 'group':
        result = groupArray(result, operation.key);
        break;
      case 'chunk':
        result = chunkArray(result, operation.size);
        break;
      case 'flatten':
        result = flattenArray(result, operation.depth);
        break;
      case 'unique':
        result = uniqueArray(result);
        break;
      case 'shuffle':
        result = shuffleArray(result);
        break;
      case 'sample':
        result = sampleArray(result, operation.size);
        break;
      default:
        break;
    }
  });
  
  return result;
};

// Array manipulation
export const chunk = (array, size) => {
  if (!array || !Array.isArray(array)) return [];
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const compact = (array) => {
  if (!array || !Array.isArray(array)) return [];
  return array.filter(Boolean);
};

export const concat = (array, ...values) => {
  if (!array || !Array.isArray(array)) return [];
  return array.concat(...values);
};

export const difference = (array, values) => {
  if (!array || !Array.isArray(array)) return [];
  if (!values || !Array.isArray(values)) return array;
  return array.filter((item) => !values.includes(item));
};

export const drop = (array, n = 1) => {
  if (!array || !Array.isArray(array)) return [];
  return array.slice(n);
};

export const dropRight = (array, n = 1) => {
  if (!array || !Array.isArray(array)) return [];
  return array.slice(0, -n);
};

export const fill = (array, value, start = 0, end = array?.length) => {
  if (!array || !Array.isArray(array)) return [];
  const result = [...array];
  for (let i = start; i < end; i++) {
    result[i] = value;
  }
  return result;
};

export const flatten = (array, depth = 1) => {
  if (!array || !Array.isArray(array)) return [];
  return array.reduce((flat, toFlatten) => {
    return flat.concat(
      Array.isArray(toFlatten) && depth > 0
        ? flatten(toFlatten, depth - 1)
        : toFlatten
    );
  }, []);
};

export const head = (array) => {
  if (!array || !Array.isArray(array) || array.length === 0) return undefined;
  return array[0];
};

export const indexOf = (array, value, fromIndex = 0) => {
  if (!array || !Array.isArray(array)) return -1;
  return array.indexOf(value, fromIndex);
};

export const initial = (array) => {
  if (!array || !Array.isArray(array)) return [];
  return array.slice(0, -1);
};

export const intersection = (array, ...arrays) => {
  if (!array || !Array.isArray(array)) return [];
  return array.filter((item) =>
    arrays.every((arr) => Array.isArray(arr) && arr.includes(item))
  );
};

export const join = (array, separator = ',') => {
  if (!array || !Array.isArray(array)) return '';
  return array.join(separator);
};

export const last = (array) => {
  if (!array || !Array.isArray(array) || array.length === 0) return undefined;
  return array[array.length - 1];
};

export const lastIndexOf = (array, value, fromIndex = array?.length - 1) => {
  if (!array || !Array.isArray(array)) return -1;
  return array.lastIndexOf(value, fromIndex);
};

export const nth = (array, n = 0) => {
  if (!array || !Array.isArray(array)) return undefined;
  return n >= 0 ? array[n] : array[array.length + n];
};

export const pull = (array, ...values) => {
  if (!array || !Array.isArray(array)) return [];
  return array.filter((item) => !values.includes(item));
};

export const pullAll = (array, values) => {
  if (!array || !Array.isArray(array)) return [];
  if (!values || !Array.isArray(values)) return array;
  return array.filter((item) => !values.includes(item));
};

export const remove = (array, predicate) => {
  if (!array || !Array.isArray(array)) return [];
  return array.filter((item) => !predicate(item));
};

export const reverse = (array) => {
  if (!array || !Array.isArray(array)) return [];
  return [...array].reverse();
};

export const slice = (array, start = 0, end = array?.length) => {
  if (!array || !Array.isArray(array)) return [];
  return array.slice(start, end);
};

export const sortedIndex = (array, value) => {
  if (!array || !Array.isArray(array)) return 0;
  let low = 0;
  let high = array.length;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (array[mid] < value) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
};

export const sortedIndexBy = (array, value, iteratee) => {
  if (!array || !Array.isArray(array)) return 0;
  let low = 0;
  let high = array.length;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (iteratee(array[mid]) < iteratee(value)) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
};

export const sortedIndexOf = (array, value) => {
  if (!array || !Array.isArray(array)) return -1;
  const index = sortedIndex(array, value);
  return array[index] === value ? index : -1;
};

export const sortedLastIndex = (array, value) => {
  if (!array || !Array.isArray(array)) return 0;
  let low = 0;
  let high = array.length;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (array[mid] <= value) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
};

export const sortedLastIndexBy = (array, value, iteratee) => {
  if (!array || !Array.isArray(array)) return 0;
  let low = 0;
  let high = array.length;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (iteratee(array[mid]) <= iteratee(value)) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
};

export const sortedLastIndexOf = (array, value) => {
  if (!array || !Array.isArray(array)) return -1;
  const index = sortedLastIndex(array, value);
  return array[index - 1] === value ? index - 1 : -1;
};

export const sortedUniq = (array) => {
  if (!array || !Array.isArray(array)) return [];
  return [...new Set(array)].sort();
};

export const sortedUniqBy = (array, iteratee) => {
  if (!array || !Array.isArray(array)) return [];
  const seen = new Set();
  return array
    .filter((item) => {
      const key = iteratee(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => iteratee(a) - iteratee(b));
};

export const tail = (array) => {
  if (!array || !Array.isArray(array)) return [];
  return array.slice(1);
};

export const take = (array, n = 1) => {
  if (!array || !Array.isArray(array)) return [];
  return array.slice(0, n);
};

export const takeRight = (array, n = 1) => {
  if (!array || !Array.isArray(array)) return [];
  return array.slice(-n);
};

export const union = (array, ...arrays) => {
  if (!array || !Array.isArray(array)) return [];
  return [...new Set([...array, ...arrays.flat()])];
};

export const uniq = (array) => {
  if (!array || !Array.isArray(array)) return [];
  return [...new Set(array)];
};

export const uniqBy = (array, iteratee) => {
  if (!array || !Array.isArray(array)) return [];
  const seen = new Set();
  return array.filter((item) => {
    const key = iteratee(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const without = (array, ...values) => {
  if (!array || !Array.isArray(array)) return [];
  return array.filter((item) => !values.includes(item));
};

export const xor = (array, ...arrays) => {
  if (!array || !Array.isArray(array)) return [];
  const allArrays = [array, ...arrays];
  const counts = new Map();

  allArrays.flat().forEach((item) => {
    counts.set(item, (counts.get(item) || 0) + 1);
  });

  return allArrays.flat().filter((item) => counts.get(item) === 1);
};

export const zip = (...arrays) => {
  if (!arrays.length) return [];
  const maxLength = Math.max(...arrays.map((arr) => arr?.length || 0));
  return Array.from({ length: maxLength }, (_, i) =>
    arrays.map((arr) => arr?.[i])
  );
};

export const zipObject = (props, values) => {
  if (!props || !Array.isArray(props)) return {};
  if (!values || !Array.isArray(values)) return {};
  return props.reduce((obj, prop, index) => {
    obj[prop] = values[index];
    return obj;
  }, {});
};

// Array validation
export const isEmpty = (array) => {
  return !array || !Array.isArray(array) || array.length === 0;
};

export const isArray = (value) => {
  return Array.isArray(value);
};

// Array transformation
export const map = (array, iteratee) => {
  if (!array || !Array.isArray(array)) return [];
  return array.map(iteratee);
};

export const filter = (array, predicate) => {
  if (!array || !Array.isArray(array)) return [];
  return array.filter(predicate);
};

export const reduce = (array, iteratee, initialValue) => {
  if (!array || !Array.isArray(array)) return initialValue;
  return array.reduce(iteratee, initialValue);
};

export const find = (array, predicate) => {
  if (!array || !Array.isArray(array)) return undefined;
  return array.find(predicate);
};

export const findIndex = (array, predicate) => {
  if (!array || !Array.isArray(array)) return -1;
  return array.findIndex(predicate);
};

export const some = (array, predicate) => {
  if (!array || !Array.isArray(array)) return false;
  return array.some(predicate);
};

export const every = (array, predicate) => {
  if (!array || !Array.isArray(array)) return true;
  return array.every(predicate);
};

// Array generation
export const range = (start = 0, end, step = 1) => {
  const array = [];
  let current = start;

  if (end === undefined) {
    end = start;
    start = 0;
  }

  while (step > 0 ? current < end : current > end) {
    array.push(current);
    current += step;
  }

  return array;
};

// Export array utilities
export default {
  filterArray,
  mapArray,
  reduceArray,
  sortArray,
  groupArray,
  chunkArray,
  flattenArray,
  uniqueArray,
  intersectArrays,
  unionArrays,
  differenceArrays,
  symmetricDifferenceArrays,
  shuffleArray,
  sampleArray,
  paginateArray,
  searchArray,
  validateArray,
  transformArray,
  aggregateArray,
  manipulateArray,
  chunk,
  compact,
  concat,
  difference,
  drop,
  dropRight,
  fill,
  flatten,
  head,
  indexOf,
  initial,
  intersection,
  join,
  last,
  lastIndexOf,
  nth,
  pull,
  pullAll,
  remove,
  reverse,
  slice,
  sortedIndex,
  sortedIndexBy,
  sortedIndexOf,
  sortedLastIndex,
  sortedLastIndexBy,
  sortedLastIndexOf,
  sortedUniq,
  sortedUniqBy,
  tail,
  take,
  takeRight,
  union,
  uniq,
  uniqBy,
  without,
  xor,
  zip,
  zipObject,
  isEmpty,
  isArray,
  map,
  filter,
  reduce,
  find,
  findIndex,
  some,
  every,
  range,
}; 