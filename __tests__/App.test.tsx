import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: { CAMERA: 'ios.permission.CAMERA' },
    ANDROID: { CAMERA: 'android.permission.CAMERA' },
  },
  RESULTS: {
    UNAVAILABLE: 'unavailable',
    BLOCKED: 'blocked',
    DENIED: 'denied',
    GRANTED: 'granted',
    LIMITED: 'limited',
  },
  check: jest.fn(async () => 'denied'),
  request: jest.fn(async () => 'granted'),
}));

jest.mock('react-native-camera-kit', () => {
  const ReactActual = require('react');
  const { View } = require('react-native');
  return {
    Camera: (props: object) => ReactActual.createElement(View, props),
    CameraType: { Front: 'front', Back: 'back' },
  };
});

test('renders the permission screen', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  const titles = renderer!.root.findAllByProps({ children: 'Permissions' });
  expect(titles.length).toBeGreaterThan(0);
});
