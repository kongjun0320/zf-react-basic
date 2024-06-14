import React from './react';
import ReactDOM from './react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));

function Child(props, forwardRef) {
  const inputRef = React.useRef(null);

  React.useImperativeHandle(forwardRef, () => ({
    getFocus() {
      inputRef.current?.focus();
    },
  }));

  return <input type="text" ref={inputRef} />;
}

const ForwardChild = React.forwardRef(Child);

function Parent() {
  const [number, setNumber] = React.useState(0);
  const inputRef = React.useRef(null);
  const getFocus = () => {
    inputRef.current?.getFocus();
  };

  return (
    <div>
      <ForwardChild ref={inputRef} />
      <button onClick={getFocus}>获取焦点</button>
      <p>{number}</p>
      <button
        onClick={() => {
          setNumber(number + 1);
        }}
      >
        +
      </button>
    </div>
  );
}

root.render(<Parent />);
