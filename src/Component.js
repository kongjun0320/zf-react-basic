import { compareTwoVDom, findDOM } from './react-dom/client';

/**
 * 这是一个更新队列
 */
export let updateQueue = {
  // 这是一个是否是批量更新的标识，默认是非批量的，是同步的
  isBatchingUpdate: false,
  // 更新的集合
  updaters: new Set(),
  //
  batchUpdate() {
    // console.log('batchUpdate >>> ');
    updateQueue.isBatchingUpdate = false;

    for (const updater of updateQueue.updaters) {
      updater.updateComponent();
    }
    updateQueue.updaters.clear();
  },
};

class Updater {
  // 每个更新器会保存一个组件类的实例
  constructor(classInstance) {
    this.classInstance = classInstance;
    // 用来存放更新状态
    this.pendingStates = [];
    this.callbacks = [];
  }

  flushCallbacks() {
    if (this.callbacks.length > 0) {
      this.callbacks.forEach((callback) => callback());
      this.callbacks.length = 0;
    }
  }

  addState(partialState, callback) {
    this.pendingStates.push(partialState);
    if (typeof callback === 'function') {
      this.callbacks.push(callback);
    }
    // 准备更新，发射更新有两种，一种是更新属性，一种是更新状态
    this.emitUpdate();
  }

  emitUpdate(nextProps) {
    // 保存传过来的新属性
    this.nextProps = nextProps;
    // 如果需要批量更新
    if (updateQueue.isBatchingUpdate) {
      // 则不要直接更新组件，而是先把更新器添加到 updaters 里去进行暂存
      updateQueue.updaters.add(this);
    } else {
      this.updateComponent();
    }
  }

  updateComponent() {
    // 获取等待生效的状态数组和类的实例
    const { pendingStates, classInstance, nextProps } = this;
    // 如果有正在等待生效的状态
    if (nextProps || pendingStates.length > 0) {
      shouldUpdate(classInstance, nextProps, this.getState());
    }
  }

  // 根据等待生效的状态数组计算新的状态
  getState() {
    const { pendingStates, classInstance } = this;
    // 先获取类的实例上的老状态
    let { state } = classInstance;

    pendingStates.forEach((partialState) => {
      if (typeof partialState === 'function') {
        partialState = partialState(state);
      }
      state = {
        ...state,
        ...partialState,
      };
    });
    pendingStates.length = 0;

    return state;
  }
}

function shouldUpdate(classInstance, nextProps, nextState) {
  // 是否要更新
  let willUpdate = true;
  // 如果 shouldComponentUpdate 存在，并且返回值为 false
  if (
    classInstance.shouldComponentUpdate &&
    !classInstance.shouldComponentUpdate(nextProps, nextState)
  ) {
    willUpdate = false;
  }

  // 如果要更新，且 classInstance.UNSAFE_componentWillUpdate 方法存在，就执行
  if (willUpdate && classInstance.UNSAFE_componentWillUpdate) {
    classInstance.UNSAFE_componentWillUpdate();
  }

  // 不管最终要不要更新页面上的组件，都会把新的状态传给 classInstance.state
  // 先把计算得到的心状态，赋给类的实例
  classInstance.state = nextState;
  if (nextProps) {
    classInstance.props = nextProps;
  }
  // 让组件强制更新
  if (willUpdate) {
    classInstance.forceUpdate();
  }
}

export class Component {
  // 给类 Component 添加一个静态属性
  static isReactComponent = true;

  constructor(props) {
    this.props = props;
    this.state = {};
    // 每个类会有一个更新器的实例
    this.updater = new Updater(this);
  }

  setState(partialState, callback) {
    this.updater.addState(partialState, callback);
  }

  forceUpdate() {
    // 先获取老的虚拟 DOM，再获取新的虚拟 DOM，找到新老虚拟 DOM 的差异，把这些差异更新到真实 DOM 上
    // 获取老的虚拟 DOM，div#counter
    const oldRenderVDom = this.oldRenderVDom;
    // 获取到此组件对应的老的真实 DOM，老的 div
    const oldDOM = findDOM(oldRenderVDom);

    if (this.constructor.contextType) {
      this.context = this.constructor.contextType._currentValue;
    }

    const { getDerivedStateFromProps } = this.constructor;
    // 可替代掉以前 componentWillReceiveProps
    if (getDerivedStateFromProps) {
      const newState = getDerivedStateFromProps(this.props, this.state);
      if (newState) {
        this.state = {
          ...this.state,
          ...newState,
        };
      }
    }

    // 根据新的状态，计算新的虚拟 DOM
    const newRenderVDom = this.render();

    let snapshot =
      this.getSnapshotBeforeUpdate && this.getSnapshotBeforeUpdate();

    // 比较新旧虚拟 DOM 的差异，把更新后的结果放在真实 DOM 上
    compareTwoVDom(oldDOM.parentNode, oldRenderVDom, newRenderVDom);
    // 在更新后，把 oldRenderVDom 更新为 newRenderVDom
    // 第一次挂载，老的 div#counter
    // 第二次更新的时候，新的 div#counter
    // replaceChild div#root -> 新的 div#root
    this.oldRenderVDom = newRenderVDom;
    this.updater.flushCallbacks();
    // 更新
    if (this.componentDidUpdate) {
      this.componentDidUpdate(this.props, this.state, snapshot);
    }
  }
}
