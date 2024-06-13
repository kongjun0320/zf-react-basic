import React from './react';
import ReactDOM from './react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));

function App() {
  const [number, setNumber] = React.useState(0);
  const [number2, setNumber2] = React.useState(0);

  const handleClick = () => {
    setNumber(number + 100);
  };

  const handleClick2 = () => {
    setNumber2(number2 + 30);
  };

  return (
    <div>
      <h1>{number}</h1>
      <button onClick={handleClick}>+100</button>
      <button onClick={handleClick2}>+30</button>
    </div>
  );
}

root.render(<App />);

/**
 
function App() {
  const [number, setNumber] = React.useState(0);
  const handleClick = () => {
    setNumber(number + 1);
  };
  
  return React.createElement("div", null, 
            React.createElement("h1", null, number), 
              React.createElement("button", {onClick: handleClick}, "+")
          );
  }

 */
