import axios from 'axios';

let cache;
const assign = (a, b) => {
  Object.keys(b).forEach((key) => {
    if (b[key] !== undefined) a[key] = b[key];
  });
  return a;
};

const endpointInit = (root) => {
  return `${root}/index.php?webserviceClient=site&webserviceVersion=1.0.0&option=reditem&view=webevent&task=init&api=hal`;
};
const endpointStart = (root) => {
  return `${root}/index.php?webserviceClient=site&webserviceVersion=1.0.0&option=reditem&view=webevent&task=start&api=hal`;
};
const endpointEnd = (root) => {
  return `${root}/index.php?webserviceClient=site&webserviceVersion=1.0.0&option=reditem&view=webevent&task=end&api=hal`;
};
const getIpAddress = async () => {
  const res = await axios.get('https://geolocation-db.com/json/');
  return res.data.IPv4;
};

/* FUNCTION */
const initTracker = async (endpoint, url, referrer, user_agent) => {
  const { document } = window;
  const { pathname, search, origin } = location;
  url = `${origin}${pathname}${search}`;
  referrer = document.referrer;
  user_agent = window.navigator.userAgent;
  const queryString = window.location.search;
  // Init Tracker
  const urlParams = new URLSearchParams(queryString);
  if (!urlParams.get('event_id') && !urlParams.get('uuid')) {
    let ip = await getIpAddress();
    const response = await initTrackerService(endpoint, {
      url: url,
      referrer: referrer,
      user_agent: user_agent,
      ip: ip,
    });
    return response;
  }
};

const startTracker = async (endpoint, event_id, uuid, referrer) => {
  // Start Tracker
  const { location, document } = window;
  referrer = document.referrer.split('?')[0];
  const url = location.protocol + '//' + location.host + location.pathname;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const responseStart = await startTrackerService(endpoint, {
    ...(urlParams.get('event_id') && {
      event_id: urlParams.get('event_id'),
    }),
    ...(urlParams.get('uuid') && {
      uuid: urlParams.get('uuid'),
    }),
    ...(event_id && {
      event_id: event_id,
    }),
    ...(uuid && {
      uuid: uuid,
    }),
    referrer: referrer === '/' ? '' : referrer,
    url: url,
  });

  return responseStart;
};

const endTracker = async (endpoint, event_id, uuid) => {
  // End Tracker
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const responseEnd = await endTrackerService(endpoint, {
    ...(urlParams.get('event_id_start') && {
      event_id: urlParams.get('event_id_start'),
    }),
    ...(urlParams.get('uuid_start') && {
      uuid: urlParams.get('uuid_start'),
    }),
    ...(event_id && {
      event_id: event_id,
    }),
    ...(uuid && {
      uuid: uuid,
    }),
  });
  return responseEnd;
};

/* SERVICES */
const initTrackerService = async (endpoint, payload) => {
  const fetchData = await fetch(endpointInit(endpoint), {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: assign({ 'Content-Type': 'application/json' }, { ['x-tracker-cache']: cache }),
  });
  const response = await fetchData.json();
  return response;
};

const startTrackerService = async (endpoint, payload) => {
  const fetchData = await fetch(endpointStart(endpoint), {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: assign({ 'Content-Type': 'application/json' }, { ['x-tracker-cache']: cache }),
  });
  const response = await fetchData.json();
  return response;
};

const endTrackerService = async (endpoint, payload) => {
  const fetchData = await fetch(endpointEnd(endpoint), {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: assign({ 'Content-Type': 'application/json' }, { ['x-tracker-cache']: cache }),
  });
  const response = await fetchData.json();

  return response;
};

function AesirAnalytics() {
  const hook = (_this, method, callback) => {
    const orig = _this[method];

    return (...args) => {
      callback.apply(null, args);

      return orig.apply(_this, args);
    };
  };

  /* Handle history changes */

  const handlePush = async (state, title, url) => {
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

  const envParams = process.env;
  const hostUrl = envParams.ENDPOINT_ANALYTICS_URL ? envParams.ENDPOINT_ANALYTICS_URL : '';

  const root = hostUrl ? hostUrl.replace(/\/$/, '') : '';

  const update = async () => {
    if (document.readyState === 'complete') {
      const responseInit = await initTracker(root);
      if (responseInit) {
        responseInit.result.event_id && insertParam('event_id', responseInit.result.event_id);
        insertParam('uuid', responseInit.result.uuid);
        replaceUrl();
      }
      const responseStart = await startTracker(root);
      if (responseStart) {
        responseStart.result.event_id &&
          insertParam('event_id_start', responseStart.result.event_id);
        insertParam('uuid_start', responseStart.result.uuid);
        replaceUrl();
      }
    }
  };

  document.addEventListener('readystatechange', update, true);

  window.addEventListener('beforeunload', async () => {
    await endTracker(root);
  });

  update();
}
const insertParam = (key, value) => {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.pushState({ path: url.href }, '', url.href);
};

const replaceUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const event_id = urlParams.get('event_id');
  const uuid = urlParams.get('uuid');
  document.querySelectorAll('[href]').forEach((link) => {
    const eventIdParams = getParameterByName('event_id', link.href);
    const uuidParams = getParameterByName('uuid', link.href);
    const url = new URL(link.href);
    !eventIdParams && event_id && url.searchParams.append('event_id', event_id);
    !uuidParams && uuid && url.searchParams.append('uuid', uuid);
    link.href = url.href;
  });
};

const getParameterByName = (name, url = window.location.href) => {
  name = name.replace(/[[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

export { initTracker, startTracker, endTracker, replaceUrl, AesirAnalytics };
