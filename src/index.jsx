import React from './react';
import ReactDOM from './react-dom/client';
// import { updateQueue } from './Component';

const root = ReactDOM.createRoot(document.getElementById('root'));

// 1、函数组件接受一个属性对象并返回一个 React 元素
// 2、函数必须以大写字母开头，因为在内部是通过大小写判断是自定义组件还是默认组件 div、span
// 3、函数组件在使用前必须先定义
// 4、函数组件能且只能返回一个根元素
// function FunctionComponent(props) {
//   return (
//     <div className="title" style={{ color: 'red' }}>
//       <span>{props.title}</span>
//     </div>
//   );
// }

// class ClassComponent extends React.Component {
//   constructor(props) {
//     super(props);

//     // 设置默认状态，在构造函数中是唯一一个可以设置默认值的地方
//     this.state = { number: 0 };
//   }

//   handleClick = () => {
//     // 在进入事件回调前先把批量更新打开
//     // updateQueue.isBatchingUpdate = true;
//     // debugger
//     this.setState({
//       number: this.state.number + 1,
//     });
//     console.log(this.state.number);
//     this.setState({
//       number: this.state.number + 1,
//     });
//     console.log(this.state.number);
//     // debugger
//     setTimeout(() => {
//       this.setState({
//         number: this.state.number + 1,
//       });
//       console.log(this.state.number);
//       this.setState({
//         number: this.state.number + 1,
//       });
//       console.log(this.state.number);
//     }, 1000);
//     // debugger
//     // 在函数结束后，把批量更新关掉
//     // updateQueue.isBatchingUpdate = false;
//     // updateQueue.batchUpdate();
//     // 除构造函数外不能直接修改 this.state，需要通过 setState 来修改状态
//     // 因为 setState 有一个副作用，就是修改完状态后会让组件重新刷新
//     // this.setState(
//     //   (state) => ({
//     //     number: state.number + 1,
//     //   }),
//     //   () => {
//     //     console.log('newState >>> ', this.state);
//     //   }
//     // );
//     // this.setState({
//     //   number: this.state.number + 1,
//     // });
//     // this.setState({
//     //   age: this.state.age + 1,
//     // });
//   };

//   clickBtn = (event) => {
//     event.stopPropagation();
//     console.log('clickBtn');
//   };

//   clickDiv = () => {
//     console.log('clickDiv');
//   };

//   // clickBtnCapture = () => {
//   //   console.log('clickBtnCapture');
//   // };

//   // clickDivCapture = () => {
//   //   console.log('clickDivCapture');
//   // };

//   render() {
//     return (
//       <div id="counter" onClick={this.clickDiv}>
//         <p>number: {this.state.number}</p>
//         {/* <p>age: {this.state.age}</p> */}
//         <button onClick={this.clickBtn}>+</button>
//       </div>
//     );
//   }
// }

// class Sum extends React.Component {
//   constructor(props) {
//     super(props);

//     this.a = React.createRef();
//     this.b = React.createRef();
//     this.c = React.createRef();
//   }

//   add = () => {
//     this.c.current.value = this.a.current.value * 1 + this.b.current.value * 1;
//   };

//   render() {
//     return (
//       <div>
//         <input type="text" ref={this.a} />
//         <span>+</span>
//         <input type="text" ref={this.b} />
//         <button onClick={this.add}>=</button>
//         <input type="text" ref={this.c} />
//       </div>
//     );
//   }
// }

// console.log('ClassComponent >>> ', ClassComponent);
// React.createElement(ClassComponent, { title: "world" });
// const element = <Sum />;

// function TextInput(props, forwardRef) {
//   return <input type="text" ref={forwardRef} />;
// }

// const ForwardTextInput = React.forwardRef(TextInput);

// class Form extends React.Component {
//   constructor(props) {
//     super(props);

//     this.ref = React.createRef();
//   }

//   getFocus = () => {
//     this.ref.current.focus();
//   };

//   render() {
//     return (
//       <div>
//         <ForwardTextInput ref={this.ref} />
//         <button onClick={this.getFocus}>获得焦点</button>
//       </div>
//     );
//   }
// }

/*
React.createElement(ForwardTextInput, {
  ref: this.ref
});
*/

// class Counter extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       number: 0,
//     };

//     console.log('Counter >>> constructor');
//   }

//   handleClick = () => {
//     this.setState({
//       number: this.state.number + 1,
//     });
//   };

//   UNSAFE_componentWillMount() {
//     console.log('Counter >>> componentWillMount');
//   }
//   render() {
//     console.log('Counter >>> render');
//     return (
//       <div>
//         <p>number: {this.state.number}</p>
//         <ChildCounter count={this.state.number} />
//         {/* {this.state.number === 4 ? null : (
//           <ChildCounter count={this.state.number} />
//         )} */}
//         <button onClick={this.handleClick}>+</button>
//       </div>
//     );
//   }

//   componentDidMount() {
//     console.log('Counter >>> componentDidMount');
//   }

//   shouldComponentUpdate(nextProps, nextState) {
//     return true;
//     // console.log('shouldComponentUpdate >>> ');
//     // return nextState.number % 2 === 0;
//   }

//   UNSAFE_componentWillUpdate() {
//     console.log('Counter >>> componentWillUpdate');
//   }

//   componentDidUpdate() {
//     console.log('Counter >>> componentDidUpdate');
//   }
// }

// function FunctionCounter(props) {
//   return <div>count: {props.count}</div>;
// }

// class ChildCounter extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       number: 0,
//     };
//   }

//   UNSAFE_componentWillReceiveProps(newProps) {
//     console.log('ChildCounter >>> componentWillReceiveProps');
//   }

//   UNSAFE_componentWillMount() {
//     console.log('ChildCounter >>> componentWillMount');
//   }

//   shouldComponentUpdate(nextProps, nextState) {
//     return true;
//     // console.log('ChildCounter >>> shouldComponentUpdate');
//     // return nextProps % 3 === 0;
//   }

//   // 通过新的属性派生出状态
//   static getDerivedStateFromProps(nextProps, prevState) {
//     const { count } = nextProps;
//     if (count % 2 === 0) {
//       return {
//         number: count * 2,
//       };
//     } else {
//       return {
//         number: count * 3,
//       };
//     }
//   }

//   render() {
//     console.log('ChildCounter >>> render');
//     return <div>count: {this.state.number}</div>;
//   }

//   componentDidMount() {
//     console.log('ChildCounter >>> componentDidMount');
//   }

//   componentWillUnmount() {
//     console.log('ChildCounter >>> componentWillUnmount');
//   }
// }

// class Counter extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       list: ['A', 'B', 'C', 'D', 'E', 'F'],
//     };
//   }

//   handleClick = () => {
//     this.setState({
//       list: ['A', 'C', 'E', 'B', 'G'],
//     });
//   };

//   render() {
//     return (
//       <div>
//         <ul>
//           {this.state.list.map((item) => (
//             <li key={item}>{item}</li>
//           ))}
//         </ul>
//         <button onClick={this.handleClick}>更新</button>
//       </div>
//     );
//   }
// }

class ScrollList extends React.Component {
  constructor(props) {
    super(props);

    this.state = { messages: [] };
    this.wrapper = React.createRef();
  }

  addMessage = () => {
    this.setState((state) => ({
      messages: [`${state.messages.length}`, ...state.messages],
    }));
  };

  componentDidMount() {
    this.timerID = window.setInterval(() => {
      this.addMessage();
    }, 1000);
  }

  // 在更新前获取真实 DOM 的快照
  getSnapshotBeforeUpdate() {
    return {
      // DOM 更更新前向上卷去的高度
      prevScrollTop: this.wrapper.current.scrollTop,
      // DOM 更新前内容的高度
      prevScrollHeight: this.wrapper.current.scrollHeight,
    };
  }

  componentDidUpdate(
    prevProps,
    prevState,
    { prevScrollTop, prevScrollHeight }
  ) {
    // 修正向上卷去的高度
    this.wrapper.current.scrollTop =
      prevScrollTop + (this.wrapper.current.scrollHeight - prevScrollHeight);
  }

  render() {
    const style = {
      height: '100px',
      width: '200px',
      border: '1px solid red',
      overflow: 'auto',
    };

    return (
      <div style={style} ref={this.wrapper}>
        {this.state.messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
    );
  }
}

const element = <ScrollList />;
root.render(element);
