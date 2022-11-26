import { endTracker, initTracker, startTracker } from './utils';

const AesirAnalytics = () => {
  const hook = (_this, method, callback) => {
    const orig = _this[method];

    return (...args) => {
      callback.apply(null, args);

      return orig.apply(_this, args);
    };
  };

  /* Handle history changes */

  const handlePush = async (url) => {
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

  if (!window.tracker) {
    const tracker = (eventValue) => eventValue;
    tracker.initTracker = initTracker;
    tracker.startTracker = startTracker;

    window.tracker = tracker;
  }

  /* Start */

  history.pushState = hook(history, 'pushState', handlePush);
  history.replaceState = hook(history, 'replaceState', handlePush);

  const hostUrl = window.aesirx1stparty ? window.aesirx1stparty : '';

  const root = hostUrl ? hostUrl.replace(/\/$/, '') : '';

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
    }
  };

  document.addEventListener('readystatechange', update, true);

  window.addEventListener('beforeunload', async () => {
    await endTracker(root);
  });

  update();
};
const insertParam = (key, value) => {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.pushState({ path: url.href }, '', url.href);
};

const replaceUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const event_id = urlParams.get('event_id');
  const uuid = urlParams.get('uuid');

  let anchors = document.getElementsByTagName('a');
  for (let i = 0; i < anchors.length; i++) {
    const eventIdParams = getParameterByName('event_id', anchors[i].href);
    const uuidParams = getParameterByName('uuid', anchors[i].href);
    if (anchors[i].href) {
      const url = new URL(anchors[i].href);
      !eventIdParams && event_id && url.searchParams.append('event_id', event_id);
      !uuidParams && uuid && url.searchParams.append('uuid', uuid);
      anchors[i].href = url.href;
    }
  }
};

const getParameterByName = (name, url = window.location.href) => {
  if (url) {
    let params = new URL(url);
    if (params.origin === window.location.origin) {
      return params.searchParams.get(name);
    }
  }
  return;
};

AesirAnalytics();
