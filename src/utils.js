import { REACT_TEXT } from './constant';

/**
 * 为了后续处理方便，把元素做了一下封装，主要就是给字符串和数字进行处理
 * @param {*} element
 * @returns
 */
export function wrapToVDom(element) {
  return typeof element === 'string' || typeof element === 'number'
    ? {
        type: REACT_TEXT,
        props: element,
      }
    : element;
}

/**
 *  判断两个对象是否相等
 * @param {*} obj1 旧的对象
 * @param {*} obj2 新的对象
 * @returns 是否相等
 */
export function shallowEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}
