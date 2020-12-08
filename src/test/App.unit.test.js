import React from 'react';
import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import ReactDOM from 'react-dom';
import App from '../App.js';
import { shallow } from 'enzyme';
import {login, authFetch, useAuth, logout} from "../auth"

let div

describe("Initiation: ", () => {
test('renders without crashing', () => {
  div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
})

describe("Checks login status function: ", () => {
  test('user is logged out in the beginning', () => {
    const result = renderHook(() => useAuth())
    expect(result['result']['current'][0]).toBeFalsy()
  })

  test('user is on the login page', () => {
    expect(global.window.location.pathname).toEqual("/");
  })
})

