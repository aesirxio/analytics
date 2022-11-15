import axios from 'axios';
import { trackerService } from './services';

const createRequest = (endpoint, task) => {
  return `${endpoint}/index.php?webserviceClient=site&webserviceVersion=1.0.0&option=reditem&view=webevent&task=${task}&api=hal`;
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
    const response = await trackerService(createRequest(endpoint, 'init'), {
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
  referrer = referrer
    ? location.protocol + '//' + location.host + referrer
    : document.referrer.split('?')[0];
  const url = location.protocol + '//' + location.host + location.pathname;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const responseStart = await trackerService(createRequest(endpoint, 'start'), {
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
  const responseEnd = await trackerService(createRequest(endpoint, 'end'), {
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

export { initTracker, startTracker, endTracker };
