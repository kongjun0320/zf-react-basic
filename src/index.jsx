import React from './react';
import ReactDOM from './react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));

function Counter() {
  const [number, setNumber] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNumber((n) => n + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  });

  return <div>{number}</div>;
}

root.render(<Counter />);
