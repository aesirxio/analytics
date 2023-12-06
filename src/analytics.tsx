import { endTrackerVisibilityState, startTracker, trackEvent } from './utils';
import {
  addToCartAnalytics,
  checkoutAnalytics,
  searchAnalytics,
  viewProductAnalytics,
} from './utils/woocommerce';
import React from 'react';

import { createRoot } from 'react-dom/client';
import { AnalyticsContext } from './utils/AnalyticsContextProvider';
import ConsentComponent from './Components/Consent';
import { Buffer } from 'buffer';
import { appLanguages } from './translations';
import { AesirXI18nextProvider } from './utils/I18nextProvider';

window.Buffer = Buffer;
declare global {
  interface Window {
    process: any;
  }
}
const ConsentPopup = ({ visitor_uuid, event_uuid }: any) => {
  window.process = { env: '' };
  return (
    <AnalyticsContext.Provider
      value={{
        event_uuid: event_uuid,
        visitor_uuid: visitor_uuid,
        setEventID: undefined,
        setUUID: undefined,
      }}
    >
      <AesirXI18nextProvider appLanguages={appLanguages}>
        <ConsentComponent
          endpoint={window['aesirx1stparty'] ?? ''}
          networkEnv={window['concordiumNetwork'] ?? ''}
          aesirXEndpoint={window['aesirxEndpoint'] ?? 'https://api.aesirx.io'}
        />
      </AesirXI18nextProvider>
    </AnalyticsContext.Provider>
  );
};

const container = document.body.appendChild(document.createElement('DIV'));

const rootElement = createRoot(container);

const AesirAnalytics = () => {
  const hook = (_this: object, method: string, callback: (_: string) => void) => {
    const orig = _this[method];

    return (...args: []) => {
      callback.apply(null, args);

      return orig.apply(_this, args);
    };
  };

  /* Handle history changes */

  const handlePush = async (url: string) => {
    if (!url) return;
    const { pathname, search, origin } = location;
    url = `${origin}${pathname}${search}`;
    const newUrl = url.toString();

    if (newUrl.substring(0, 4) === 'http') {
      url = '/' + newUrl.split('/').splice(3).join('/');
    } else {
      url = newUrl;
    }
  };

  /* Global */

  if (!window['tracker']) {
    const tracker = (eventValue: string) => eventValue;
    tracker.startTracker = startTracker;

    window['tracker'] = tracker;
  }

  /* Start */

  history.pushState = hook(history, 'pushState', handlePush);
  history.replaceState = hook(history, 'replaceState', handlePush);

  const hostUrl = window['aesirx1stparty'] ? window['aesirx1stparty'] : '';

  const root = hostUrl ? hostUrl.replace(/\/$/, '') : '';

  const { currentScript } = document;
  if (!currentScript) return;
  const _data = 'data-';
  const _false = 'false';
  const attr = currentScript.getAttribute.bind(currentScript);
  const dataEvents = attr(_data + 'aesirx-event-name') !== _false;
  const eventSelect = '[data-aesirx-event-name]';

  const update = async () => {
    if (document.readyState === 'complete') {
      const responseStart = await startTracker(root);
      if (responseStart) {
        window['event_uuid'] = responseStart.event_uuid;
        window['visitor_uuid'] = responseStart.visitor_uuid;
      }
      if (window['disableAnalyticsConsent'] !== 'true') {
        rootElement.render(
          <ConsentPopup
            event_uuid={responseStart.visitor_uuid}
            visitor_uuid={responseStart.visitor_uuid}
          />
        );
      }

      if (dataEvents) {
        addEvents(document);
      }
    }
  };

  document.addEventListener('readystatechange', update, true);

  endTrackerVisibilityState(root);

  /* Handle events */

  const addEvents = (node: Document) => {
    const elements = node.querySelectorAll(eventSelect);
    Array.prototype.forEach.call(elements, addEvent);
  };

  const addEvent = (element: HTMLInputElement) => {
    element.addEventListener(
      'click',
      () => {
        const attribute: object[] = [];
        Object.keys(element.dataset).forEach((key) => {
          if (key.startsWith('aesirxEventAttribute')) {
            attribute.push({
              name: key.replace('aesirxEventAttribute', '').toLowerCase(),
              value: element.dataset[key],
            });
          }
        });
        trackEvent(root, '', {
          event_name: element.dataset.aesirxEventName,
          event_type: element.dataset.aesirxEventType,
          attributes: attribute,
        });
      },
      true
    );
  };

  update();
};

const WoocommerceAnalytics = () => {
  addToCartAnalytics();
  searchAnalytics();
  checkoutAnalytics();
  viewProductAnalytics();
};

AesirAnalytics();
document.addEventListener('DOMContentLoaded', () => {
  if (
    document.body.classList.contains('woocommerce-js') ||
    document.body.classList.contains('woocommerce-no-js')
  ) {
    WoocommerceAnalytics();
  }
});
