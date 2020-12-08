import React from "react";
import { shallow } from 'enzyme';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import View from "../components/View";
import ReactDOM from 'react-dom';
import * as auth from "../auth"

let wrapper
  
describe("Initiation: ", () => {
  beforeEach(() => {
    wrapper= shallow(<View />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('renders the animation player', () => {
    expect(wrapper.find('#play')).toHaveLength(1);
    expect(wrapper.find('#pause')).toHaveLength(1);
    expect(wrapper.find('#stop')).toHaveLength(1); 
    expect(wrapper.find('#slider')).toHaveLength(1);
  })

  test('renders the audio recorder', () => {
    expect(wrapper.find('#audio-recorder')).toHaveLength(1);
  })

  test('renders the 3d model', () => {
    expect(wrapper.find('#model')).toHaveLength(1);
  })

  test('does not render any popups', () => {
    expect(wrapper.find('.popup')).toHaveLength(0);
    expect(wrapper.find('.loader')).toHaveLength(0);
  })

  test('renders the upload input', () => {
    expect(wrapper.find('#upload-input')).toHaveLength(1);
    expect(wrapper.find('#upload-button')).toHaveLength(1);
    expect(wrapper.find('#upload-text')).toHaveLength(0);
  })

  test('initialises correct states', () => {
    expect(wrapper.state('animationStatus')).toBe('STOP');
    expect(wrapper.state('inputProcessed')).toBeFalsy();
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


describe('Checks the state of the application after uploading a file to the server: ', () => {
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
    var response = { "status" : 200 , "result" : [0, 0] };
    const responseInit = {
      status: 200,
      statusText: 'ok',
    };
    auth.authFetch = jest.fn().mockResolvedValue(Promise.resolve(new Response(JSON.stringify(response), responseInit)))

  await act(async () => {
    wrapper.instance().sendFile()
  });
    expect(wrapper.state('animationStatus')).toBe('STOP');
    expect(wrapper.state('visemes')).not.toBeUndefined();
    expect(wrapper.state('inputProcessed')).toBeTruthy();
    auth.authFetch.mockRestore()
  })
})
