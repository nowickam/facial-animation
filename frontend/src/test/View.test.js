import React from "react";
import { shallow } from 'enzyme';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import View from "../components/View";
import ReactDOM from 'react-dom';

const axios = require('axios');

jest.mock('axios');
let wrapper
  
describe("initiation: ", () => {
  beforeEach(() => {
    wrapper= shallow(<View />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('renders the correct content', () => {
    expect(wrapper.find('#play')).toHaveLength(1);
    expect(wrapper.find('#pause')).toHaveLength(1);
    expect(wrapper.find('#stop')).toHaveLength(1);
    expect(wrapper.find('#upload-input')).toHaveLength(1);
    expect(wrapper.find('#upload-button')).toHaveLength(1);
    expect(wrapper.find('#upload-text')).toHaveLength(0);
    expect(wrapper.find('#model')).toHaveLength(1);

    expect(wrapper.state('animationStatus')).toBe('STOP');
  })

test('player buttons do not change the state when there is no audio file', () => {
  wrapper.find('#play').prop('onClick')("test");
  expect(wrapper.state('animationStatus')).toBe('STOP');

  wrapper.find('#pause').prop('onClick');
  expect(wrapper.state('animationStatus')).toBe('STOP');

  wrapper.find('#stop').prop('onClick');
  expect(wrapper.state('animationStatus')).toBe('STOP');
})
})


describe('upload: ', () => {
  beforeAll(() => {
    wrapper= shallow(<View />);
    wrapper.find('#upload-input').prop('onChange')({
      target: {
         files: [
           'dummy.mp3'
         ]   
      }
    });
  });

  test('state after upload is changed correctly (new file is registered and unprocessed yet)', () => {
    expect(wrapper.state('inputProcessed')).toBeFalsy()
    expect(wrapper.state('file')).not.toBeUndefined()
  })

  test('sends files to the server and processes the response (the new animation moves are received and processed, the current animation stops)', async () => {
    const dummyResponse = {
      data : [0, 0]
    };
    axios.post.mockResolvedValue(
      dummyResponse
  );

  await act(async () => {
    wrapper.instance().sendFile()
  });
    expect(wrapper.state('animationStatus')).toBe('STOP');
    expect(wrapper.state('visemes')).not.toBeUndefined();
    expect(wrapper.state('inputProcessed')).toBeTruthy();
    axios.post.mockRestore()
  })
})
