import { initTracker, startTracker } from './utils';
import { endTracker } from './utils';

let visitor_uuid = '';
let event_uuid_start = '';
const endPoint = process.env.ENDPOINT_ANALYTICS_URL;

describe('Analytics', () => {
  it('Init Tracker', async () => {
    const response = await initTracker(endPoint);
    visitor_uuid = response?.visitor_uuid;
    expect(response).not.toBe(false);
  });
  it('Start Tracker', async () => {
    const referrer = `/`;
    const response = await startTracker(endPoint, visitor_uuid, referrer);
    event_uuid_start = response?.event_uuid;
    expect(response).not.toBe(false);
  });
  it('End Tracker', async () => {
    const response = await endTracker(endPoint, event_uuid_start, visitor_uuid);
    expect(response).not.toBe(false);
  });
});
