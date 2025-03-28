// Object cloning
export const cloneObject = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Object merging
export const mergeObjects = (target, source) => {
  return { ...target, ...source };
};

// Deep object merging
export const deepMergeObjects = (target, source) => {
  const output = { ...target };
  
  for (const key in source) {
    if (isObject(target[key]) && isObject(source[key])) {
      output[key] = deepMergeObjects(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  
  return output;
};

// Object filtering
export const filterObject = (obj, predicate) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => predicate(key, value))
  );
};

// Object mapping
export const mapObject = (obj, mapper) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => mapper(key, value))
  );
};

// Object reduction
export const reduceObject = (obj, reducer, initialValue) => {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => reducer(acc, key, value),
    initialValue
  );
};

// Object sorting
export const sortObject = (obj, options = {}) => {
  const {
    by = 'key',
    order = 'asc',
    type = 'string',
  } = options;
  
  return Object.fromEntries(
    Object.entries(obj).sort(([keyA, valueA], [keyB, valueB]) => {
      let compareA = by === 'key' ? keyA : valueA;
      let compareB = by === 'key' ? keyB : valueB;
      
      if (type === 'number') {
        compareA = Number(compareA);
        compareB = Number(compareB);
      } else if (type === 'date') {
        compareA = new Date(compareA);
        compareB = new Date(compareB);
      }
      
      if (order === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    })
  );
};

// Object grouping
export const groupObject = (obj, key) => {
  return Object.values(obj).reduce((groups, item) => {
    const groupKey = item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
};

// Object flattening
export const flattenObject = (obj, prefix = '') => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (isObject(value)) {
      return { ...acc, ...flattenObject(value, newKey) };
    }
    
    return { ...acc, [newKey]: value };
  }, {});
};

// Object unflattening
export const unflattenObject = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const keys = key.split('.');
    let current = acc;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[keys[keys.length - 1]] = value;
    return acc;
  }, {});
};

// Object picking
export const pickObject = (obj, keys) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => keys.includes(key))
  );
};

// Object omitting
export const omitObject = (obj, keys) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key))
  );
};

// Object path getting
export const getObjectPath = (obj, path, defaultValue = undefined) => {
  return path.split('.').reduce((current, key) => {
    return current && key in current ? current[key] : defaultValue;
  }, obj);
};

// Object path setting
export const setObjectPath = (obj, path, value) => {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return obj;
};

// Object path deletion
export const deleteObjectPath = (obj, path) => {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      return obj;
    }
    current = current[key];
  }
  
  delete current[keys[keys.length - 1]];
  return obj;
};

// Object validation
export const validateObject = (obj, rules) => {
  const errors = {};
  
  Object.entries(rules).forEach(([key, rule]) => {
    const value = obj[key];
    
    if (rule.required && value === undefined) {
      errors[key] = 'Field is required';
    } else if (rule.type && typeof value !== rule.type) {
      errors[key] = `Field must be of type ${rule.type}`;
    } else if (rule.validate) {
      const error = rule.validate(value);
      if (error) {
        errors[key] = error;
      }
    }
  });
  
  return errors;
};

// Object transformation
export const transformObject = (obj, transformations) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const transform = transformations[key];
    acc[key] = transform ? transform(value) : value;
    return acc;
  }, {});
};

// Object comparison
export const compareObjects = (obj1, obj2, options = {}) => {
  const {
    deep = false,
    ignoreKeys = [],
    ignoreValues = [],
  } = options;
  
  if (deep) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
  
  const keys1 = Object.keys(obj1).filter((key) => !ignoreKeys.includes(key));
  const keys2 = Object.keys(obj2).filter((key) => !ignoreKeys.includes(key));
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  return keys1.every((key) => {
    const value1 = obj1[key];
    const value2 = obj2[key];
    
    if (ignoreValues.includes(value1) || ignoreValues.includes(value2)) {
      return true;
    }
    
    return value1 === value2;
  });
};

// Object manipulation
export const manipulateObject = (obj, operations) => {
  let result = { ...obj };
  
  operations.forEach((operation) => {
    switch (operation.type) {
      case 'filter':
        result = filterObject(result, operation.predicate);
        break;
      case 'map':
        result = mapObject(result, operation.mapper);
        break;
      case 'sort':
        result = sortObject(result, operation.options);
        break;
      case 'group':
        result = groupObject(result, operation.key);
        break;
      case 'flatten':
        result = flattenObject(result, operation.prefix);
        break;
      case 'unflatten':
        result = unflattenObject(result);
        break;
      case 'pick':
        result = pickObject(result, operation.keys);
        break;
      case 'omit':
        result = omitObject(result, operation.keys);
        break;
      case 'set':
        result = setObjectPath(result, operation.path, operation.value);
        break;
      case 'delete':
        result = deleteObjectPath(result, operation.path);
        break;
      default:
        break;
    }
  });
  
  return result;
};

// Helper function to check if value is an object
const isObject = (value) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

// Export object utilities
export default {
  cloneObject,
  mergeObjects,
  deepMergeObjects,
  filterObject,
  mapObject,
  reduceObject,
  sortObject,
  groupObject,
  flattenObject,
  unflattenObject,
  pickObject,
  omitObject,
  getObjectPath,
  setObjectPath,
  deleteObjectPath,
  validateObject,
  transformObject,
  compareObjects,
  manipulateObject,
}; 