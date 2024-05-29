import React from './react';
import ReactDOM from './react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));

const element = (
  <div className="title" style={{ color: 'red' }}>
    <span>hello</span>
  </div>
);

console.log('element >>> ', element);

root.render(element);
