import React from './react';
import ReactDOM from './react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));

function Animation() {
  const ref = React.useRef();

  React.useLayoutEffect(() => {
    ref.current.style.transform = `translate(500px)`;
    ref.current.style.transition = `all 500ms`;
  }, []);

  const styleObj = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: 'red',
  };

  return <div style={styleObj} ref={ref}></div>;
}

root.render(<Animation />);
