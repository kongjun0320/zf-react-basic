import { REACT_FORWARD_REF, REACT_TEXT } from '../constant';
import { addEvent } from './event';

function mount(vDom, container) {
  const newDOM = createDOM(vDom);
  container.appendChild(newDOM);

  if (newDOM.componentDidMount) {
    newDOM.componentDidMount();
  }
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
  vDom.dom = dom;
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
  // 让虚拟 DOM 的 classInstance 属性指向类的实例
  vDom.classInstance = classInstance;

  if (ref) {
    ref.current = classInstance;
  }

  if (classInstance.UNSAFE_componentWillMount) {
    classInstance.UNSAFE_componentWillMount();
  }

  const renderVDom = classInstance.render();
  // 在获取 render 的渲染结果后把此结果放到 classInstance.oldRenderVDom 上进行暂存
  classInstance.oldRenderVDom = renderVDom;
  let dom = createDOM(renderVDom);

  if (classInstance.componentDidMount) {
    dom.componentDidMount = classInstance.componentDidMount.bind(classInstance);
  }

  return dom;
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
  // 如果 vdom 对应原生组件的话，肯定有 trueDOM 属性指向真实 DOM
  if (vDom.dom) {
    return vDom.dom;
  } else {
    // 否则可能是类组件或者是函数组件
    const oldRenderVDom = vDom.classInstance
      ? vDom.classInstance.oldRenderVDom
      : vDom.oldRenderVDom;
    return findDOM(oldRenderVDom);
  }
}

/**
 * 比较新的和老的虚拟 DOM，实现 DOM - DIFF
 * @param {*} parentDOM 老的父真实 DOM
 * @param {*} oldVDom 老的虚拟 DOM
 * @param {*} newVDom 新的虚拟 DOM
 * @param {*} nextDOM newVDom 下一个真实 DOM 元素
 */
export function compareTwoVDom(parentDOM, oldVDom, newVDom, nextDOM) {
  // let oldDOM = findDOM(oldVDom);
  // let newDOM = createDOM(newVDom);
  // parentDOM.replaceChild(newDOM, oldDOM);
  // 如果老的虚拟 DOM 和新的虚拟 DOM 都是 null 或 undefined
  if (!oldVDom && !newVDom) {
    return;
  } else if (oldVDom && !newVDom) {
    // 老的有，新的没有
    unMountVDom(oldVDom);
  } else if (!oldVDom && newVDom) {
    // 创建新的虚拟 DOM 对应的真实 DOM
    let newDOM = createDOM(newVDom);
    if (nextDOM) {
      parentDOM.insertBefore(newDOM, nextDOM);
    } else {
      parentDOM.appendChild(newDOM);
    }
    // TODO 可能有问题
    if (newDOM.componentDidMount) {
      newDOM.componentDidMount();
    }
  } else if (oldVDom && newVDom && oldVDom.type !== newVDom.type) {
    // 虽然老的有，新的也有，但是类型不同，则也不能复用老
    let newDOM = createDOM(newVDom);
    // 卸载老的
    unMountVDom(oldVDom);
    // 插入新的
    if (nextDOM) {
      parentDOM.insertBefore(newDOM, nextDOM);
    } else {
      parentDOM.appendChild(newDOM);
    }
    // TODO 可能有问题
    if (newDOM.componentDidMount) {
      newDOM.componentDidMount();
    }
  } else {
    // 老的有，新的也有，类型也一样，就可以复用老的真实 DOM
    updateElement(oldVDom, newVDom);
  }
}

/**
 * 更新元素
 * @param {*} oldVDom 老的虚拟 DOM
 * @param {*} newVDom 新的虚拟 DOM
 */
function updateElement(oldVDom, newVDom) {
  // 如果新老的虚拟 DOM 都是文本节点的话
  if (oldVDom.type === REACT_TEXT) {
    // 复用老的 DOM 节点
    let currentDOM = (newVDom.dom = findDOM(oldVDom));
    if (oldVDom.props !== newVDom.props) {
      currentDOM.textContent = newVDom.props;
    }
    return;
    // 如果是原生组件的话，就是指 span div p
  } else if (typeof oldVDom.type === 'string') {
    let currentDOM = (newVDom.dom = findDOM(oldVDom));
    // 用新的虚拟 DOM 属性更新老的属性
    updateProps(currentDOM, oldVDom.props, newVDom.props);
    updateChildren(currentDOM, oldVDom.props.children, newVDom.props.children);
  } else if (typeof oldVDom.type === 'function') {
    // 如果类型是一个函数的话，说明肯定是一个组件
    if (oldVDom.type.isReactComponent) {
      updateClassComponent(oldVDom, newVDom);
    } else {
      updateFunctionComponent(oldVDom, newVDom);
    }
  }
}

function updateClassComponent(oldVDom, newVDom) {
  // let currentDOM = findDOM(oldVDom);
  // 复用老的类组件实例
  let classInstance = (newVDom.classInstance = oldVDom.classInstance);
  if (classInstance.UNSAFE_componentWillReceiveProps) {
    classInstance.UNSAFE_componentWillReceiveProps(newVDom.props);
  }
  classInstance.updater.emitUpdate(newVDom.props);
}

function updateFunctionComponent(oldVDom, newVDom) {
  let currentDOM = findDOM(oldVDom);
  if (!currentDOM) {
    return;
  }
  // 获取当前的真实 DOM 节点
  let parentDOM = currentDOM.parentNode;
  // 重新执行函数获取新的虚拟 DOM
  const { type, props } = newVDom;
  const newRenderVDom = type(props);
  // 比较新旧虚拟 DOM
  compareTwoVDom(parentDOM, oldVDom.oldRenderVDom, newRenderVDom);
  // 还要把 newRenderVDom 保存起来
  newVDom.oldRenderVDom = newRenderVDom;
}

/**
 * 更新它的子节点
 * @param {*} parentDOM 父真实 DOM
 * @param {*} oldVChildren 老的子虚拟DOM
 * @param {*} newVChildren 新的子虚拟DOM
 */
function updateChildren(parentDOM, oldVChildren, newVChildren) {
  oldVChildren = (
    Array.isArray(oldVChildren) ? oldVChildren : [oldVChildren]
  ).filter(Boolean);
  newVChildren = (
    Array.isArray(newVChildren) ? newVChildren : [newVChildren]
  ).filter(Boolean);
  // 获取两个儿子数组的最大长度
  let maxLength = Math.max(oldVChildren.length, newVChildren.length);
  for (let i = 0; i < maxLength; i++) {
    // 找到下一个不为空
    let nextVDom = oldVChildren.find(
      (item, index) => index > i && item && findDOM(item)
    );
    compareTwoVDom(
      parentDOM,
      oldVChildren[i],
      newVChildren[i],
      findDOM(nextVDom)
    );
  }
}

function unMountVDom(vDom) {
  const { type, props, ref } = vDom;
  // 获取此虚拟 DOM 对应的真实 DOM
  let currentDOM = findDOM(vDom);

  if (vDom.classInstance && vDom.classInstance.componentWillUnmount) {
    vDom.classInstance.componentWillUnmount();
  }

  if (ref) {
    ref.current = null;
  }

  if (props.children) {
    const children = Array.isArray(props.children)
      ? props.children
      : [props.children];
    children.forEach(unMountVDom);
  }

  // 如果此虚拟 DOM 对应了真实 DOM，则把此真实 DOM 进行删除
  if (currentDOM) {
    currentDOM.remove();
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
