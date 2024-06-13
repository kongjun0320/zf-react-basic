import {
  REACT_CONTEXT,
  REACT_ELEMENT,
  REACT_FORWARD_REF,
  REACT_PROVIDER,
} from './constant';
import { wrapToVDom } from './utils';
import { Component } from './Component';

/**
 * 根据参数返回一个 React 元素
 * @param {string} type 元素类型 div span
 * @param {object} config 配置对象 className style
 * @param {*} children 后面所有的参数都是 children，children 有可能有、也可能没有、可能有一个、也可能有多个
 */
function createElement(type, config, children) {
  let ref, key;
  if (config) {
    delete config.__source;
    delete config.__self;
    // 用来引用此元素的
    ref = config.ref;
    delete config.ref;
    // 用来标记一个父亲的唯一儿子的
    key = config.key;
    delete config.key;
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
    ref,
    key,
  };
}

function createRef() {
  return {
    current: null,
  };
}

// 其实函数组件本质上就是 render 方法，就是接收属性，返回 react 元素
function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF,
    render, // 其实就是原来的函数组件
  };
}

function createContext() {
  const context = {
    _currentValue: undefined,
  };

  context.Provider = {
    $$typeof: REACT_PROVIDER,
    _context: context,
  };
  context.Consumer = {
    $$typeof: REACT_CONTEXT,
    _context: context,
  };

  return context;
}

function cloneElement(element, newProps, children) {
  let props = {
    ...element.props,
    ...newProps,
  };

  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVDom);
  } else if (arguments.length === 3) {
    // 如果等于 3，只有一个儿子
    props.children = wrapToVDom(children);
  }

  return {
    ...element,
    props,
  };
}

const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
  createContext,
  cloneElement,
};

export default React;
