import { updateQueue } from '../Component';

/**
 * 给 DOM 元素添加事件处理函数
 * @param {*} dom
 * @param {*} eventType onClick onClickCapture
 * @param {*} handler
 */
export function addEvent(dom, eventType, handler) {
  // 判断 dom 元素上有没有 store 属性，如果有直接返回，如果没，则赋值为空对象
  let store = dom.store || (dom.store = {});
  // 向 store 中存放属性和值，属性是事件类型 onclick，值是一个事件处理函数
  store[eventType.toLowerCase()] = handler;
  const eventName = eventType.slice(2).toLowerCase();
  if (!document[eventName]) {
    document.addEventListener(
      eventName,
      (event) => {
        dispatchEvent(event, true);
      },
      true
    );
    document.addEventListener(
      eventName,
      (event) => {
        dispatchEvent(event, false);
      },
      false
    );
    document[eventName] = true;
    // document.addEventListener('click', dispatchEvent, true);
    // document.addEventListener('click', dispatchEvent, false);
    // document[eventType.toLowerCase()] = dispatchEvent;
  }
}

function dispatchEvent(event, isCapture) {
  // 为什么要做事件委托，为什么要把子 DOM 的事件全部委托给父亲
  // 1、为了减少绑定，提高性能
  // 2、统一进行事件处理，实现合成事件
  // target 事件源 button，type 是事件名称 click
  const { target, type } = event;
  const eventType = `on${type}`; // onclick
  const eventTypeCapture = `on${type}capture`; // onclickCapture
  const syntheticEvent = createSyntheticEvent(event);
  // 在执行函数之前，开启批量更新
  updateQueue.isBatchingUpdate = true;
  // 为了和源码一样，我们需要自己模拟捕获和冒泡的过程
  //   我们需要先记录一栈结构
  const targetStack = [];
  let currentTarget = target;
  while (currentTarget) {
    targetStack.push(currentTarget); // button div#counter div#root document
    currentTarget = currentTarget.parentNode;
  }
  if (isCapture) {
    // 处理捕获阶段
    for (let i = targetStack.length - 1; i >= 0; i--) {
      const _currentTarget = targetStack[i];
      const { store } = _currentTarget;
      const handler = store && store[eventTypeCapture];
      handler && handler(syntheticEvent);
    }
  } else {
    // 处理冒泡阶段
    for (let i = 0; i < targetStack.length; i++) {
      const _currentTarget = targetStack[i];
      const { store } = _currentTarget;
      const handler = store && store[eventType];
      handler && handler(syntheticEvent);
      // 阻止冒泡了
      if (syntheticEvent.isPropagationStopped) {
        break;
      }
    }
  }
  // 第一个先获取当前的事件源 document
  //   let currentTarget = event.currentTarget;
  //   while (currentTarget) {
  //     const { store } = currentTarget;
  //     const handler = store && store[eventTypeCapture];
  //     handler && handler(syntheticEvent);
  //   }
  //   执行批量更新
  updateQueue.batchUpdate();
}

/**
 * 根据原生事件对象创建合成事件
 * @param {*} event
 */
function createSyntheticEvent(nativeEvent) {
  let syntheticEvent = {};
  for (const key in nativeEvent) {
    let value = nativeEvent[key];
    if (typeof value === 'function') {
      value = value.bind(nativeEvent);
    }
    syntheticEvent[key] = value;
  }

  syntheticEvent.nativeEvent = nativeEvent;
  // 是否已经阻止了默认事件
  syntheticEvent.isDefaultPrevented = false;
  syntheticEvent.preventDefault = preventDefault;

  // 是否已经阻止冒泡
  syntheticEvent.isPropagationStopped = false;
  syntheticEvent.stopPropagation = stopPropagation;

  return syntheticEvent;
}

function preventDefault() {
  this.isDefaultPrevented = true;
  const nativeEvent = this.nativeEvent;
  if (nativeEvent.preventDefault) {
    nativeEvent.preventDefault();
  } else {
    nativeEvent.returnValue = false;
  }
}

function stopPropagation() {
  this.isPropagationStopped = true;
  const nativeEvent = this.nativeEvent;
  if (nativeEvent.stopPropagation) {
    nativeEvent.stopPropagation();
  } else {
    nativeEvent.cancelBubble = true;
  }
}
