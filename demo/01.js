import React from 'react';

React.createElement(
  'div',
  {
    className: 'title',
    style: {
      color: 'red',
    },
  },
  React.createElement('span', null, 'hello'),
  React.createElement('p', null, 'world')
);

React.createElement(
  'div',
  {
    className: 'title',
    style: {
      color: 'red',
    },
  },
  React.createElement('span', null, 'hello')
);
