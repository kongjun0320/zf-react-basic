import { REACT_TEXT } from '../constant';

function mount(vDom, container) {
  const newDOM = createDOM(vDom);
  container.appendChild(newDOM);
}

function createDOM(vDom) {
  const { type, props } = vDom;
  let dom;
  if (type === REACT_TEXT) {
    dom = document.createTextNode(props);
  } else {
    dom = document.createElement(type);
  }
  if (typeof props === 'object') {
    updateProps(dom, {}, props);

    if (props.children) {
      // 如果是独生子的话，把独生子的虚拟 DOM 转换成真实 DOM 挂载到父亲上
      if (typeof props.children === 'object' && props.children.type) {
        mount(props.children, dom);
      } else if (Array.isArray(props.children)) {
        reconcileChildren(props.children, dom);
      }
    }
  }
  return dom;
}

function reconcileChildren(childrenVDom, parentDOM) {
  for (let i = 0; i < childrenVDom.length; i++) {
    mount(childrenVDom[i], parentDOM);
  }
}

/**
 * 更新 DOM 元素的属性
 * 1、把新的属性全部赋上去
 * 2、把老的属性在新的属性对象没有，删除掉
 */
function updateProps(dom, oldProps = {}, newProps = {}) {
  for (const key in newProps) {
    // children 属性会在后面单独处理
    if (key === 'children') {
      continue;
    } else if (key === 'style') {
      const style = newProps[key];
      for (const attr in style) {
        dom.style[attr] = style[attr];
      }
    } else {
      dom[key] = newProps[key];
    }

    // 删除旧属性
    for (const key in oldProps) {
      if (!newProps.hasOwnProperty(key)) {
        dom[key] = null;
      }
    }
  }
}

class DOMRoot {
  constructor(container) {
    this.container = container;
  }

  render(vDom) {
    mount(vDom, this.container);
  }
}

function createRoot(container) {
  return new DOMRoot(container);
}

const ReactDOM = {
  createRoot,
};

export default ReactDOM;
