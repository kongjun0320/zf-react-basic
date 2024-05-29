import { REACT_ELEMENT } from './constant';
import { wrapToVDom } from './utils';

/**
 * 根据参数返回一个 React 元素
 * @param {string} type 元素类型 div span
 * @param {object} config 配置对象 className style
 * @param {*} children 后面所有的参数都是 children，children 有可能有、也可能没有、可能有一个、也可能有多个
 */
function createElement(type, config, children) {
  if (config) {
    delete config.__source;
    delete config.__self;
  }
  let props = { ...config };
  // 如果参数数量大于 3 ，说明有儿子，并且儿子的数量大于 1 个
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVDom);
  } else if (arguments.length === 3) {
    // 如果等于 3，只有一个儿子
    props.children = wrapToVDom(children);
  }
  // 如果说小于，说明没儿子，
  return {
    $$typeof: REACT_ELEMENT,
    type,
    props,
  };
}

const React = {
  createElement,
};

export default React;
