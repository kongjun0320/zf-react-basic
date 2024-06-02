import { REACT_FORWARD_REF, REACT_TEXT } from '../constant';
import { addEvent } from './event';

function mount(vDom, container) {
  const newDOM = createDOM(vDom);
  container.appendChild(newDOM);
}

function createDOM(vDom) {
  const { type, props, ref } = vDom;
  let dom;
  if (type && type.$$typeof === REACT_FORWARD_REF) {
    return mountForwardComponent(vDom);
  } else if (type === REACT_TEXT) {
    dom = document.createTextNode(props);
  } else if (typeof type === 'function') {
    if (type.isReactComponent) {
      return mountClassComponent(vDom);
    } else {
      return mountFunctionComponent(vDom);
    }
  } else {
    // 原生组件
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
  // 根据虚拟 DOM 创建真实 DOM，成功后，就可以建立关联
  vDom.trueDom = dom;
  // 如果此虚拟 DOM 上有 ref 属性，则把 ref.current 的值赋真实 DOM
  if (ref) {
    ref.current = dom;
  }
  return dom;
}

function reconcileChildren(childrenVDom, parentDOM) {
  for (let i = 0; i < childrenVDom.length; i++) {
    mount(childrenVDom[i], parentDOM);
  }
}

function mountForwardComponent(vDom) {
  const { type, props, ref } = vDom;
  // type.render 就是 forward 函数组件
  const renderVDom = type.render(props, ref);
  // 暂存
  vDom.oldRenderVDom = renderVDom;
  return createDOM(renderVDom);
}

function mountFunctionComponent(vDom) {
  const { type: FunctionComponent, props } = vDom;
  const renderVDom = FunctionComponent(props);
  // 暂存
  vDom.oldRenderVDom = renderVDom;
  return createDOM(renderVDom);
}

function mountClassComponent(vDom) {
  const { type: ClassComponent, props, ref } = vDom;
  const classInstance = new ClassComponent(props);
  if (ref) {
    ref.current = classInstance;
  }
  const renderVDom = classInstance.render();
  // 在获取 render 的渲染结果后把此结果放到 classInstance.oldRenderVDom 上进行暂存
  classInstance.oldRenderVDom = renderVDom;
  return createDOM(renderVDom);
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
    } else if (/^on[A-Z].*/.test(key)) {
      // dom[key.toLowerCase()] = newProps[key];
      addEvent(dom, key, newProps[key]);
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

export function findDOM(vDom) {
  if (!vDom) return null;
  return vDom.trueDom;
}

export function compareTwoVDom(parentDOM, oldVDom, newVDom) {
  let oldDOM = findDOM(oldVDom);
  let newDOM = createDOM(newVDom);
  parentDOM.replaceChild(newDOM, oldDOM);
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
