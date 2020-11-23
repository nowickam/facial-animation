import React from "react";
import { shallow } from 'enzyme';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import Login from "./components/Login";
import ReactDOM from 'react-dom';

const axios = require('axios');

jest.mock('axios');
let wrapper
  
describe("initiation", () => {
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


    // expect(wrapper.state('animationStatus')).toBe('STOP');
  })

// test('player buttons do not change the state when there is no audio file', () => {
//   wrapper.find('#play').prop('onClick')("test");
//   expect(wrapper.state('animationStatus')).toBe('STOP');

//   wrapper.find('#pause').prop('onClick');
//   expect(wrapper.state('animationStatus')).toBe('STOP');

//   wrapper.find('#stop').prop('onClick');
//   expect(wrapper.state('animationStatus')).toBe('STOP');
// })
 })


// describe('upload', () => {
//   beforeAll(() => {
//     wrapper= shallow(<View />);
//     wrapper.find('#upload').prop('onChange')({
//       target: {
//          files: [
//            'dummy.mp3'
//          ]   
//       }
//     });
//   });

//   test('state after upload is changed correctly', () => {
//     expect(wrapper.state('inputProcessed')).toBeFalsy()
//     expect(wrapper.state('file')).not.toBeUndefined()
//   })

//   test('sends the data to server', async () => {
//     const dummyResponse = {
//       data : [0, 0]
//     };
//     axios.post.mockResolvedValue(
//       dummyResponse
//   );

//   await act(async () => {
//     wrapper.instance().sendFile()
//   });
//     expect(wrapper.state('animationStatus')).toBe('STOP');
//     expect(wrapper.state('mouthMoves')).not.toBeUndefined();
//     expect(wrapper.state('inputProcessed')).toBeTruthy();
//   })
// })
