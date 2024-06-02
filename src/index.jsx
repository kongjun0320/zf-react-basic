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

class ClassComponent extends React.Component {
  constructor(props) {
    super(props);

    // 设置默认状态，在构造函数中是唯一一个可以设置默认值的地方
    this.state = { number: 0 };
  }

  handleClick = () => {
    // 在进入事件回调前先把批量更新打开
    // updateQueue.isBatchingUpdate = true;
    // debugger
    this.setState({
      number: this.state.number + 1,
    });
    console.log(this.state.number);
    this.setState({
      number: this.state.number + 1,
    });
    console.log(this.state.number);
    // debugger
    setTimeout(() => {
      this.setState({
        number: this.state.number + 1,
      });
      console.log(this.state.number);
      this.setState({
        number: this.state.number + 1,
      });
      console.log(this.state.number);
    }, 1000);
    // debugger
    // 在函数结束后，把批量更新关掉
    // updateQueue.isBatchingUpdate = false;
    // updateQueue.batchUpdate();
    // 除构造函数外不能直接修改 this.state，需要通过 setState 来修改状态
    // 因为 setState 有一个副作用，就是修改完状态后会让组件重新刷新
    // this.setState(
    //   (state) => ({
    //     number: state.number + 1,
    //   }),
    //   () => {
    //     console.log('newState >>> ', this.state);
    //   }
    // );
    // this.setState({
    //   number: this.state.number + 1,
    // });
    // this.setState({
    //   age: this.state.age + 1,
    // });
  };

  clickBtn = () => {
    console.log('clickBtn');
  };

  clickDiv = () => {
    console.log('clickDiv');
  };

  clickBtnCapture = () => {
    console.log('clickBtnCapture');
  };

  clickDivCapture = () => {
    console.log('clickDivCapture');
  };

  render() {
    return (
      <div
        id="counter"
        onClick={this.clickDiv}
        onClickCapture={this.clickDivCapture}
      >
        <p>number: {this.state.number}</p>
        {/* <p>age: {this.state.age}</p> */}
        <button onClick={this.clickBtn} onClickCapture={this.clickBtnCapture}>
          +
        </button>
      </div>
    );
  }
}

// console.log('ClassComponent >>> ', ClassComponent);
// React.createElement(ClassComponent, { title: "world" });
root.render(<ClassComponent title="world" />);
