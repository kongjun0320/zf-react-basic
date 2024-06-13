import React from './react';
import ReactDOM from './react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));

class Dialog extends React.Component {
  constructor(props) {
    super(props);

    this.dialogElement = document.createElement('div');
    document.body.appendChild(this.dialogElement);
  }

  render() {
    return ReactDOM.createPortal(
      <div className="dialog">{this.props.children}</div>,
      this.dialogElement
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>我这里要显示一个模态窗口</h1>
        <Dialog>我是对话框的内容</Dialog>
      </div>
    );
  }
}

root.render(<App />);
