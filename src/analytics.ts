import {
  endTrackerVisibilityState,
  initTracker,
  insertParam,
  replaceUrl,
  startTracker,
  trackEvent,
} from './utils';

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

    // if (currentUrl !== currentRef) {
    //   await initTracker();
    //   startTracker();
    // }
  };

  /* Global */

  if (!window['tracker']) {
    const tracker = (eventValue: string) => eventValue;
    tracker.initTracker = initTracker;
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
      const responseInit = await initTracker(root);
      if (responseInit) {
        responseInit.visitor_uuid && insertParam('visitor_uuid', responseInit.visitor_uuid);
      }
      const responseStart = await startTracker(root);
      if (responseStart) {
        window['event_uuid_start'] = responseStart.event_uuid;
        window['visitor_uuid_start'] = responseStart.visitor_uuid;
      }
      const urlParams = new URLSearchParams(window.location.search);
      const visitor_uuid = urlParams.get('visitor_uuid');
      visitor_uuid && replaceUrl(visitor_uuid);

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
        trackEvent(root, '', '', {
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

AesirAnalytics();
