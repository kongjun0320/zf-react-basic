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
