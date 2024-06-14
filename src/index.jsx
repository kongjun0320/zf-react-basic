import React from './react';
import ReactDOM from './react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));

function Counter() {
  const [number, setNumber] = React.useState(0);
  const numberRef = React.useRef(number);

  const handleClick = () => {
    const nextNumber = number + 1;
    setNumber(nextNumber);
    numberRef.current = nextNumber;
  };

  const handleShowNumber = React.useCallback(() => {
    console.log('number >>> ', number);
    console.log('numberRef >>> ', numberRef.current);
  }, []);

  return (
    <div>
      <p>{number}</p>
      <button onClick={handleClick}>+</button>
      <button onClick={handleShowNumber}>Show Number</button>
    </div>
  );
}

root.render(<Counter />);
