import 'react-app-polyfill/ie9';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
// Flat polyfill
import 'core-js/features/array/flat';
import './index.css';
import './fonts/BebasNeue-Regular.ttf';
import 'reflect-metadata';
import { enableMapSet } from 'immer';
import React from 'react';
import { render } from 'react-dom';
import { LocalizeProvider } from 'react-localize-redux';
import { Provider } from 'react-redux';
import PIXI from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/canvas/utils/PixiProvider';

import App from './apps/App/App';
import ServiceWorkerProvider from './common/react/ServiceWorkerProvider';
import getStore from './redux/store';
import SGErrorBoundary from 'common/react/ErrorBoundary';

require('typeface-roboto-condensed');
require('typeface-roboto-mono');
require('typeface-roboto-slab');

enableMapSet();
PIXI.utils.skipHello();

const store = getStore();

const CompleteApp = () => {
  return (
    <SGErrorBoundary>
      <Provider store={store}>
        <ServiceWorkerProvider>
          <LocalizeProvider store={store}>
            <App />
          </LocalizeProvider>
        </ServiceWorkerProvider>
      </Provider>
    </SGErrorBoundary>
  );
};

const rootElement = document.getElementById('root');

render(<CompleteApp />, rootElement);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// useServiceWorker();
// serviceWorker.register();
