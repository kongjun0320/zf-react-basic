import {
  REACT_CONTEXT,
  REACT_FORWARD_REF,
  REACT_MEMO,
  REACT_PROVIDER,
  REACT_TEXT,
} from '../constant';
import { addEvent } from './event';

function mount(vDom, container) {
  const newDOM = createDOM(vDom);
  if (newDOM) {
    container.appendChild(newDOM);
    if (newDOM.componentDidMount) {
      newDOM.componentDidMount();
    }
  }
}

let hookStates = [];
let hookIndex = 0;

let scheduleUpdate;

export function useState(initialState) {
  return useReducer(null, initialState);
  // const oldState = (hookStates[hookIndex] =
  //   hookStates[hookIndex] || initialState);
  // const currentIndex = hookIndex;

  // function setState(action) {
  //   let newState = typeof action === 'function' ? action(oldState) : action;
  //   hookStates[currentIndex] = newState;
  //   scheduleUpdate();
  // }

  // return [hookStates[hookIndex++], setState];
}

export function useMemo(factory, deps) {
  // 第一次挂载的时候，肯定是空的
  if (hookStates[hookIndex]) {
    const [lastMemo, lastDeps] = hookStates[hookIndex];
    const same = deps.every((item, index) => item === lastDeps[index]);
    // 新的依赖数组和老的依赖数组完全相等
    if (same) {
      hookIndex++;
      return lastMemo;
    } else {
      const newMemo = factory();
      hookStates[hookIndex++] = [newMemo, deps];
      return newMemo;
    }
  } else {
    const newMemo = factory();
    hookStates[hookIndex++] = [newMemo, deps];
    return newMemo;
  }
}

export function useCallback(callback, deps) {
  // 第一次挂载的时候，肯定是空的
  if (hookStates[hookIndex]) {
    const [lastCallback, lastDeps] = hookStates[hookIndex];
    const same = deps.every((item, index) => item === lastDeps[index]);
    // 新的依赖数组和老的依赖数组完全相等
    if (same) {
      hookIndex++;
      return lastCallback;
    } else {
      hookStates[hookIndex++] = [callback, deps];
      return callback;
    }
  } else {
    hookStates[hookIndex++] = [callback, deps];
    return callback;
  }
}

export function useReducer(reducer, initialState) {
  const oldState = (hookStates[hookIndex] =
    hookStates[hookIndex] || initialState);
  const currentIndex = hookIndex;

  function dispatch(action) {
    let newState = reducer
      ? reducer(oldState, action)
      : typeof action === 'function'
      ? action(oldState)
      : action;
    hookStates[currentIndex] = newState;
    scheduleUpdate();
  }

  return [hookStates[hookIndex++], dispatch];
}

export function useContext(context) {
  return context._currentValue;
}

export function useEffect(callback, deps) {
  const currentIndex = hookIndex;
  if (hookStates[hookIndex]) {
    const [destroy, lastDeps] = hookStates[hookIndex];
    const same = deps && deps.every((item, index) => item === lastDeps[index]);
    if (same) {
      hookIndex++;
    } else {
      destroy && destroy();
      setTimeout(() => {
        // 执行 callback，保存返回的 destroy 销毁函数
        hookStates[currentIndex] = [callback(), deps];
      });
      hookIndex++;
    }
  } else {
    setTimeout(() => {
      // 执行 callback，保存返回的 destroy 销毁函数
      hookStates[currentIndex] = [callback(), deps];
    });
    hookIndex++;
  }
}

export function useLayoutEffect(callback, deps) {
  const currentIndex = hookIndex;
  if (hookStates[hookIndex]) {
    const [destroy, lastDeps] = hookStates[hookIndex];
    const same = deps && deps.every((item, index) => item === lastDeps[index]);
    if (same) {
      hookIndex++;
    } else {
      destroy && destroy();
      queueMicrotask(() => {
        // 执行 callback，保存返回的 destroy 销毁函数
        hookStates[currentIndex] = [callback(), deps];
      });
      hookIndex++;
    }
  } else {
    queueMicrotask(() => {
      // 执行 callback，保存返回的 destroy 销毁函数
      hookStates[currentIndex] = [callback(), deps];
    });
    hookIndex++;
  }
}

export function useRef(initialState) {
  hookStates[hookIndex] = hookStates[hookIndex] || {
    current: initialState,
  };

  return hookStates[hookIndex++];
}

export function useImperativeHandle(ref, handler) {
  ref.current = handler();
}

function createDOM(vDom) {
  const { type, props, ref } = vDom;
  let dom;
  if (type && type.$$typeof === REACT_MEMO) {
    return mountMemoComponent(vDom);
  } else if (type && type.$$typeof === REACT_PROVIDER) {
    return mountProviderComponent(vDom);
  } else if (type && type.$$typeof === REACT_CONTEXT) {
    return mountConsumerComponent(vDom);
  } else if (type && type.$$typeof === REACT_FORWARD_REF) {
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
        props.children.mountIndex = 0;
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

function mountMemoComponent(vDom) {
  const { type, props } = vDom;
  const renderVDom = type.type(props);

  if (!renderVDom) {
    return null;
  }

  vDom.oldRenderVDom = renderVDom;
  return createDOM(renderVDom);
}

function mountProviderComponent(vDom) {
  const { type, props } = vDom;
  const context = type._context;
  context._currentValue = props.value;

  const renderVDom = props.children;

  if (!renderVDom) {
    return null;
  }

  vDom.oldRenderVDom = renderVDom;
  return createDOM(renderVDom);
}

function mountConsumerComponent(vDom) {
  const { type, props } = vDom;
  const context = type._context;

  const renderVDom = props.children(context._currentValue);

  if (!renderVDom) {
    return null;
  }

  vDom.oldRenderVDom = renderVDom;
  return createDOM(renderVDom);
}

function reconcileChildren(childrenVDom, parentDOM) {
  for (let i = 0; i < childrenVDom.length; i++) {
    childrenVDom[i].mountIndex = i;
    mount(childrenVDom[i], parentDOM);
  }
}

function mountForwardComponent(vDom) {
  const { type, props, ref } = vDom;
  // type.render 就是 forward 函数组件
  const renderVDom = type.render(props, ref);

  if (!renderVDom) {
    return null;
  }

  // 暂存
  vDom.oldRenderVDom = renderVDom;
  return createDOM(renderVDom);
}

function mountFunctionComponent(vDom) {
  const { type: FunctionComponent, props } = vDom;
  const renderVDom = FunctionComponent(props);

  if (!renderVDom) {
    return null;
  }

  // 暂存
  vDom.oldRenderVDom = renderVDom;
  return createDOM(renderVDom);
}

function mountClassComponent(vDom) {
  const { type: ClassComponent, props, ref } = vDom;
  const classInstance = new ClassComponent(props);
  // 让虚拟 DOM 的 classInstance 属性指向类的实例
  vDom.classInstance = classInstance;

  if (ClassComponent.contextType) {
    classInstance.context = ClassComponent.contextType._currentValue;
  }

  if (ref) {
    ref.current = classInstance;
  }

  if (classInstance.UNSAFE_componentWillMount) {
    classInstance.UNSAFE_componentWillMount();
  }

  const renderVDom = classInstance.render();

  if (!renderVDom) {
    return null;
  }

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
  if (oldVDom.type.$$typeof === REACT_FORWARD_REF) {
    updateForwardComponent(oldVDom, newVDom);
  } else if (oldVDom.type.$$typeof === REACT_MEMO) {
    updateMemoComponent(oldVDom, newVDom);
  } else if (oldVDom.type.$$typeof === REACT_CONTEXT) {
    updateContextComponent(oldVDom, newVDom);
  } else if (oldVDom.type.$$typeof === REACT_PROVIDER) {
    updateProviderComponent(oldVDom, newVDom);
  } else if (oldVDom.type === REACT_TEXT) {
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

function updateForwardComponent(oldVDom, newVDom) {
  let currentDOM = findDOM(oldVDom);
  if (!currentDOM) {
    return;
  }
  // 获取当前的真实 DOM 节点
  let parentDOM = currentDOM.parentNode;
  // 重新执行函数获取新的虚拟 DOM
  const { type, props, ref } = newVDom;
  const newRenderVDom = type.render(props, ref);
  // 比较新旧虚拟 DOM
  compareTwoVDom(parentDOM, oldVDom.oldRenderVDom, newRenderVDom);
  // 还要把 newRenderVDom 保存起来
  newVDom.oldRenderVDom = newRenderVDom;
}

function updateMemoComponent(oldVDom, newVDom) {
  const {
    type: { compare, type },
  } = oldVDom;
  if (compare(oldVDom.props, newVDom.props)) {
    newVDom.oldRenderVDom = oldVDom.oldRenderVDom;
  } else {
    const oldDOM = findDOM(oldVDom);
    const parentDOM = oldDOM.parentNode;
    const renderVDom = type(newVDom.props);
    compareTwoVDom(parentDOM, oldVDom.oldRenderVDom, renderVDom);
    newVDom.oldRenderVDom = renderVDom;
  }
}

function updateProviderComponent(oldVDom, newVDom) {
  // 获取父 DOM 节点
  let parentDOM = findDOM(oldVDom).parentNode;
  const { type, props } = newVDom;
  let context = type._context;
  context._currentValue = props.value;

  const renderVDom = props.children;
  compareTwoVDom(parentDOM, oldVDom.oldRenderVDom, renderVDom);
  newVDom.oldRenderVDom = renderVDom;
}

function updateContextComponent(oldVDom, newVDom) {
  let parentDOM = findDOM(oldVDom).parentNode;
  const { type, props } = newVDom;
  let context = type._context;

  const renderVDom = props.children(context._currentValue);
  compareTwoVDom(parentDOM, oldVDom.oldRenderVDom, renderVDom);
  newVDom.oldRenderVDom = renderVDom;
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
  // 存放老节点的 map, 属性是所有的老节点的 key，值是老节点的 key 对应的老节点
  const keyedOldMap = {};
  // 上一个放置好的，不需要移动元素的索引
  let lastPlacedIndex = -1;
  oldVChildren.forEach((oldVChild, index) => {
    // 如果用户提供了 key，就用用户提供的 key，否则就使用 index 索引
    let oldKey = oldVChild.key ? oldVChild.key : index;
    keyedOldMap[oldKey] = oldVChild;
  });
  // 创建一个补丁包，存放将要进行的操作
  let patch = [];
  // 遍历新的虚拟 DOM 数组
  newVChildren.forEach((newVChild, index) => {
    newVChild.mountIndex = index;
    let newkey = newVChild.key ? newVChild.key : index;
    // 用新的 key 去老的 Map 中找没有没可复用的虚拟 DOM
    let oldVChild = keyedOldMap[newkey];
    // 如果找到了就可以复用
    if (oldVChild) {
      // 有就直接进行更新
      updateElement(oldVChild, newVChild);
      // 再判断此节点是否需要移动
      // 如果此可复用的老节点的挂载索引比上一个不需要移动的节点索引要小的话，那就需要移动
      if (oldVChild.mountIndex < lastPlacedIndex) {
        // 1 < 4
        patch.push({
          type: 'MOVE',
          oldVChild, // 移动老 B
          newVChild,
          mountIndex: index, // 3
        });
      }
      // 把可以复用的老的虚拟 DOM 节点从 map 中删除
      delete keyedOldMap[newkey];
      // 更新 lastPlacedIndex
      lastPlacedIndex = Math.max(lastPlacedIndex, oldVChild.mountIndex);
    } else {
      patch.push({
        type: 'PLACEMENT',
        newVChild,
        mountIndex: index,
      });
    }
  });
  // 执行 patch 中的操作
  // 获取所有需要移动的元素
  const moveVChildren = patch
    .filter((action) => action.type === 'MOVE')
    .map((action) => action.oldVChild);
  // 获取所有留在 Map 中的老的虚拟DOM，加上移动的老的虚拟 DOM
  // 直接从老的真实 DOM 中删除 D F E B
  Object.values(keyedOldMap)
    .concat(moveVChildren)
    .forEach((oldVChild) => {
      let currentDOM = findDOM(oldVChild);
      parentDOM.removeChild(currentDOM);
    });
  // 插入和移动
  // [{type: 'MOVE'}, {type: 'PLACEMENT'}]
  patch.forEach((action) => {
    const { type, oldVChild, newVChild, mountIndex } = action;
    // 获取老的真实 DOM 的集合
    let oldTrueDOMs = parentDOM.childNodes;
    if (type === 'PLACEMENT') {
      // 先根据新的虚拟DOM，创建新的真实DOM
      let newDOM = createDOM(newVChild);
      const oldTrueDOM = oldTrueDOMs[mountIndex];
      if (oldTrueDOM) {
        // 如果要挂载的索引处有真实 DOM，就是插到它的前面
        parentDOM.insertBefore(newDOM, oldTrueDOM);
      } else {
        parentDOM.appendChild(newDOM);
      }
    } else if (type === 'MOVE') {
      // B 的真实 DOM
      let oldDOM = findDOM(oldVChild);
      // 获取挂载索引处现在的真实 DOM
      let oldTrueDOM = oldTrueDOMs[mountIndex];
      if (oldTrueDOM) {
        // 如果要挂载的索引处有真实 DOM，就是插到它的前面
        parentDOM.insertBefore(oldDOM, oldTrueDOM);
      } else {
        parentDOM.appendChild(oldDOM);
      }
    }
  });

  // 获取两个儿子数组的最大长度
  // let maxLength = Math.max(oldVChildren.length, newVChildren.length);
  // for (let i = 0; i < maxLength; i++) {
  //   // 找到下一个不为空
  //   let nextVDom = oldVChildren.find(
  //     (item, index) => index > i && item && findDOM(item)
  //   );
  //   compareTwoVDom(
  //     parentDOM,
  //     oldVChildren[i],
  //     newVChildren[i],
  //     findDOM(nextVDom)
  //   );
  // }
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

    scheduleUpdate = () => {
      hookIndex = 0;
      compareTwoVDom(this.container, vDom, vDom);
    };
  }
}

function createRoot(container) {
  return new DOMRoot(container);
}

const ReactDOM = {
  createRoot,
  createPortal: function (vDom, container) {
    mount(vDom, container);
  },
};

export default ReactDOM;
