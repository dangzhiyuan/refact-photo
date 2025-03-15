/**
 * Zustand状态管理辅助函数
 * 提供通用的状态更新模式，减少store实现中的冗余代码
 */

/**
 * 创建一个更新嵌套对象的函数
 * 使用深度合并而不是浅合并
 * 
 * @param obj 要更新的原始对象
 * @param path 要更新的路径，如 ['a', 'b', 'c'] 表示更新 obj.a.b.c
 * @param value 新值
 * @returns 新对象，保持原对象结构不变
 */
export const updateDeep = <T extends Record<string, any>>(
  obj: T,
  path: string[],
  value: any
): T => {
  if (path.length === 0) return { ...obj, ...value };
  
  const [first, ...rest] = path;
  
  return {
    ...obj,
    [first]: rest.length === 0
      ? { ...(obj[first] || {}), ...value }
      : updateDeep(obj[first] || {}, rest, value)
  };
};

/**
 * 创建一个对象更新函数，用于Zustand的set
 * 
 * @example
 * // 在store中使用:
 * updateObject: (updates) => set((state) => updateObject(state, 'settings', updates))
 */
export const updateObject = <T, K extends keyof T>(
  state: T,
  key: K,
  updates: Partial<T[K]>
): T => {
  return {
    ...state,
    [key]: {
      ...(state[key] as any),
      ...(updates as any)
    }
  };
};

/**
 * 创建一个嵌套对象更新函数，用于Zustand的set
 * 
 * @example
 * // 在store中使用:
 * updateNestedState: (path, updates) => set((state) => updateNested(state, path, updates))
 */
export const updateNested = <T extends Record<string, any>, U extends Record<string, any>>(
  state: T,
  path: (string | number)[],
  updates: U
): T => {
  // 复制state以避免直接修改
  const result = { ...state };
  let current: any = result;
  
  // 遍历路径直到倒数第二个元素
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    // 确保当前路径存在，如果不存在则创建一个空对象
    if (current[key] === undefined) {
      current[key] = typeof path[i + 1] === 'number' ? [] : {};
    } else {
      // 复制当前级别以避免直接修改
      current[key] = Array.isArray(current[key]) 
        ? [...current[key]]
        : { ...current[key] };
    }
    current = current[key];
  }
  
  // 更新最终对象
  const lastKey = path[path.length - 1];
  if (current[lastKey] === undefined) {
    current[lastKey] = updates;
  } else {
    current[lastKey] = {
      ...current[lastKey],
      ...updates
    };
  }
  
  return result;
};

/**
 * 在数组中添加一个新项目
 * 
 * @example
 * // 在store中使用:
 * addItem: (item) => set((state) => addArrayItem(state, 'items', item))
 */
export const addArrayItem = <T, K extends keyof T>(
  state: T,
  key: K,
  item: any
): T => {
  const array = state[key] as unknown as any[];
  return {
    ...state,
    [key]: [...array, item]
  };
};

/**
 * 从数组中移除一个项目
 * 
 * @example
 * // 在store中使用:
 * removeItem: (id) => set((state) => removeArrayItem(state, 'items', item => item.id === id))
 */
export const removeArrayItem = <T, K extends keyof T>(
  state: T,
  key: K,
  predicate: (item: any, index: number) => boolean
): T => {
  const array = state[key] as unknown as any[];
  return {
    ...state,
    [key]: array.filter((item, index) => !predicate(item, index))
  };
};

/**
 * 更新数组中的一个项目
 * 
 * @example
 * // 在store中使用:
 * updateItem: (id, updates) => set((state) => updateArrayItem(state, 'items', item => item.id === id, updates))
 */
export const updateArrayItem = <T, K extends keyof T>(
  state: T,
  key: K,
  predicate: (item: any, index: number) => boolean,
  updates: any
): T => {
  const array = state[key] as unknown as any[];
  return {
    ...state,
    [key]: array.map((item, index) => 
      predicate(item, index) ? { ...item, ...updates } : item
    )
  };
}; 