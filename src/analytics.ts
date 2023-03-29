import { endTracker, initTracker, startTracker, trackEvent } from './utils';

const AesirAnalytics = () => {
  const hook = (_this: object, method: string, callback: Function) => {
    const orig = _this[method];

    return (...args: (string | object)[]) => {
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
        responseInit.event_uuid && insertParam('event_uuid', responseInit.event_uuid);
        insertParam('visitor_uuid', responseInit.visitor_uuid);
        replaceUrl();
      }
      const responseStart = await startTracker(root);
      if (responseStart) {
        responseStart.event_uuid && insertParam('event_uuid_start', responseStart.event_uuid);
        insertParam('visitor_uuid_start', responseStart.visitor_uuid);
        replaceUrl();
      }

      if (dataEvents) {
        addEvents(document);
      }
    }
  };

  document.addEventListener('readystatechange', update, true);

  window.addEventListener('beforeunload', async () => {
    await endTracker(root);
  });

  /* Handle events */

  const addEvents = (node: HTMLInputElement) => {
    const elements = node.querySelectorAll(eventSelect);
    Array.prototype.forEach.call(elements, addEvent);
  };

  const addEvent = (element: HTMLInputElement) => {
    element.addEventListener(
      'click',
      () => {
        let attribute: object[] = [];
        Object.keys(element.dataset).forEach((key) => {
          if (key.startsWith('aesirxEventAttribute')) {
            attribute.push({
              name: key.replace('aesirxEventAttribute', '').toLowerCase(),
              value: element.dataset[key],
            });
          }
        });
        trackEvent(root, '', '', '', {
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
const insertParam = (key: string, value: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.pushState({ path: url.href }, '', url.href);
};

const replaceUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const event_uuid = urlParams.get('event_uuid');
  const visitor_uuid = urlParams.get('visitor_uuid');

  let anchors = document.getElementsByTagName('a');

  for (let i = 0; i < anchors.length; i++) {
    const eventIdParams = getParameterByName('event_uuid', anchors[i].href);
    const visitorIdParams = getParameterByName('visitor_uuid', anchors[i].href);
    if (anchors[i].href) {
      const url = new URL(anchors[i].href);
      !eventIdParams && event_uuid && url.searchParams.append('event_uuid', event_uuid);
      !visitorIdParams && visitor_uuid && url.searchParams.append('visitor_uuid', visitor_uuid);
      anchors[i].href = url.href;
    }
  }
};

const getParameterByName = (name: string, url = window.location.href) => {
  if (url) {
    let params = new URL(url);
    if (params.origin === window.location.origin) {
      return params.searchParams.get(name);
    }
  }
  return;
};

AesirAnalytics();
