import { startTracker } from './utils';
import { endTracker } from './utils';

let event_uuid = '';
let visitor_uuid = '';
const endPoint = process.env.ENDPOINT_ANALYTICS_URL;

describe('Analytics', () => {
  it('Start Tracker', async () => {
    const response = await startTracker(endPoint);
    event_uuid = response?.event_uuid;
    visitor_uuid = response?.visitor_uuid;
    expect(response).not.toBe(false);
  });
  it('End Tracker', async () => {
    const response = await endTracker(endPoint, event_uuid, visitor_uuid);
    expect(response).not.toBe(false);
  });
});
