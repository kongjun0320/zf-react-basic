import React from './react';
import ReactDOM from './react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));

// 1、函数组件接受一个属性对象并返回一个 React 元素
// 2、函数必须以大写字母开头，因为在内部是通过大小写判断是自定义组件还是默认组件 div、span
// 3、函数组件在使用前必须先定义
// 4、函数组件能且只能返回一个根元素
function FunctionComponent(props) {
  return (
    <div className="title" style={{ color: 'red' }}>
      <span>{props.title}</span>
    </div>
  );
}

console.log('FunctionComponent >>> ', FunctionComponent);
// React.createElement(FunctionComponent, { title: "world" });
root.render(<FunctionComponent title="world" />);
