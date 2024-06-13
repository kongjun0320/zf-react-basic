import React from 'react';
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));

const Child = ({ data, handlerClick }) => {
  console.log('Child >>> ');
  return <button onClick={handlerClick}>{data.number}</button>;
};

const MemoChild = React.memo(Child);

function App() {
  console.log('App >>> ');
  const [name, setName] = React.useState('aic');
  const [number, setNumber] = React.useState(0);
  const data = React.useMemo(() => {
    return { number };
  }, [number]);
  const handlerClick = React.useCallback(() => setNumber(number + 1), [number]);

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <MemoChild data={data} handlerClick={handlerClick} />
    </div>
  );
}

root.render(<App />);
