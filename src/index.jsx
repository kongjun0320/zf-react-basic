import React from './react';
import ReactDOM from './react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));

// 如果类组件继承 PureComponent，意味着当属性不变的时候，不重新渲染，跳过更新的逻辑
class ClassCounter extends React.PureComponent {
  render() {
    console.log('ClassCounter render >>> ');
    return <div>ClassCounter Count: {this.props.count}</div>;
  }
}

function FunctionCounter(props) {
  console.log('FunctionCounter render >>> ');
  return <div>FunctionCounter Count: {props.count}</div>;
}

const MemoFunctionCounter = React.memo(FunctionCounter);

class App extends React.Component {
  state = {
    number: 0,
  };
  amountRef = React.createRef();

  handleClick = () => {
    const amount = parseInt(this.amountRef.current.value, 10);
    this.setState((state) => ({ number: state.number + amount }));
  };

  render() {
    console.log('App render >>> ');
    return (
      <div>
        <span>number: {this.state.number}</span>
        <ClassCounter count={this.state.number} />
        <MemoFunctionCounter count={this.state.number} />
        <input type="text" ref={this.amountRef} />
        <button onClick={this.handleClick}>+</button>
      </div>
    );
  }
}

root.render(<App />);
