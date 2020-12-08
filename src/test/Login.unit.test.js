import React from "react";
import { shallow } from 'enzyme';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import Login from "../components/Login";
import ReactDOM from 'react-dom';

const axios = require('axios');

jest.mock('axios');
let wrapper
  
describe("Initiation: ", () => {
  beforeEach(() => {
    wrapper= shallow(<Login />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('renders the correct content', () => {
    expect(wrapper.find('#username')).toHaveLength(1);
    expect(wrapper.find('#password')).toHaveLength(1);
    expect(wrapper.find('#login-button')).toHaveLength(1);
  })
 })


describe('Validates login inputs:', () => {
  beforeAll(() => {
    wrapper= shallow(<Login />);
  });

  test('login button is disabled for empty username or password', () => {
      expect(wrapper.find("#login-button").prop('disabled')).toBeTruthy()
  })

  test('login button is enabled for non-empty username and password', () => {
    wrapper.find('#username-form').prop('onChange')({
        target: {
           value: "dummyName"
        }
      });
      wrapper.find('#password-form').prop('onChange')({
          target: {
             value: "dummyPassword"
          }
        });
    expect(wrapper.find("#login-button").prop('disabled')).toBeFalsy()
  })
});


//   test('renders the view page for correct username and password', async () => {
//     const dummyResponse = {
//         data: {
//             status : 200
//         }
//     };
//     axios.post.mockResolvedValue(
//       dummyResponse
//   );

//   await act(async () => {
//     wrapper.instance().validateData()
//   });
//   expect(wrapper.instance().state.status).toBe('CORRECT')
// })

// test('renders the login page incorrect username and password', async () => {
//     const dummyResponse = {
//         data: {
//             status : 404
//         }
//     };
//     axios.post.mockResolvedValue(
//       dummyResponse
//   );

//   await act(async () => {
//     wrapper.instance().validateData()
//   });
//   expect(wrapper.instance().state.status).toBe('FALSE')
// })
// })