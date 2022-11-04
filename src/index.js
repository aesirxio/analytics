import axios from 'axios';

const { location, localStorage, document, history } = window;
const { pathname, search, origin } = location;
let currentUrl = `${origin}${pathname}${search}`;
let currentRef = document.referrer;
let currentUserAgent = window.navigator.userAgent;
let cache;
const assign = (a, b) => {
  Object.keys(b).forEach((key) => {
    if (b[key] !== undefined) a[key] = b[key];
  });
  return a;
};

const hostUrl = process.env.ENDPOINT_URL ? process.env.ENDPOINT_URL : '';
const root = hostUrl ? hostUrl.replace(/\/$/, '') : '';
const endpointInit = `${root}/index.php?webserviceClient=site&webserviceVersion=1.0.0&option=reditem&view=webevent&task=init&api=hal`;
const endpointStart = `${root}/index.php?webserviceClient=site&webserviceVersion=1.0.0&option=reditem&view=webevent&task=start&api=hal`;
const endpointEnd = `${root}/index.php?webserviceClient=site&webserviceVersion=1.0.0&option=reditem&view=webevent&task=end&api=hal`;

const getIpAddress = async () => {
  const res = await axios.get('https://geolocation-db.com/json/');
  return res.data.IPv4;
};

/* FUNCTION */
const initTracker = async (
  url = currentUrl,
  referrer = currentRef,
  user_agent = currentUserAgent
) => {
  // Init Tracker
  if (!localStorage.getItem('event_id') && !localStorage.getItem('uuid')) {
    let ip = await getIpAddress();
    const response = await initTrackerService({
      url: url,
      referrer: referrer,
      user_agent: user_agent,
      ip: ip,
    });
    response.result.event_id && localStorage.setItem('event_id', response.result.event_id);
    localStorage.setItem('uuid', response.result.uuid);
  }
};

const startTracker = async (url = currentUrl, referrer = currentRef) => {
  // Start Tracker
  const responseStart = await startTrackerService({
    ...(localStorage.getItem('event_id') && {
      event_id: localStorage.getItem('event_id'),
    }),
    uuid: localStorage.getItem('uuid'),
    referrer: referrer,
    url: url,
  });
  if (responseStart) {
    responseStart.result.event_id &&
      localStorage.setItem('event_id_start', responseStart.result.event_id);
    localStorage.setItem('uuid_start', responseStart.result.uuid);
  }
};

const endTracker = async () => {
  // End Tracker
  const responseEnd = await endTrackerService({
    ...(localStorage.getItem('event_id_start') && {
      event_id: localStorage.getItem('event_id_start'),
    }),
    uuid: localStorage.getItem('uuid_start'),
  });
  return responseEnd;
};

/* SERVICES */
const initTrackerService = async (payload) => {
  const fetchData = await fetch(endpointInit, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: assign({ 'Content-Type': 'application/json' }, { ['x-tracker-cache']: cache }),
  });
  const response = await fetchData.json();
  return response;
};

const startTrackerService = async (payload) => {
  const fetchData = await fetch(endpointStart, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: assign({ 'Content-Type': 'application/json' }, { ['x-tracker-cache']: cache }),
  });
  const response = await fetchData.json();
  return response;
};

const endTrackerService = async (payload) => {
  const fetchData = await fetch(endpointEnd, {
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

    currentRef = currentUrl;
    const newUrl = url.toString();

    if (newUrl.substring(0, 4) === 'http') {
      currentUrl = '/' + newUrl.split('/').splice(3).join('/');
    } else {
      currentUrl = newUrl;
    }

    if (currentUrl !== currentRef) {
      await initTracker();
      startTracker();
    }
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

  const update = async () => {
    if (document.readyState === 'complete') {
      await initTracker();
      startTracker();
    }
  };

  document.addEventListener('readystatechange', update, true);

  window.addEventListener('beforeunload', async () => {
    await endTracker();
  });

  update();
}
AesirAnalytics();

export { initTracker, startTracker, endTracker };
