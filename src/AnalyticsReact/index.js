import React, { useState } from 'react';

import { AnalyticsContextProvider } from '../utils/AnalyticsContextProvider';
import AnalyticsHandle from './handle';
const AnalyticsReact = ({ pathname }) => {
  const [eventID, setEventID] = useState();
  const [UUID, setUUID] = useState();
  const [eventIDStart, setEventIDStart] = useState();
  const [UUIDStart, setUUIDStart] = useState();
  return (
    <>
      <AnalyticsContextProvider
        value={{
          event_uuid: eventID,
          visitor_uuid: UUID,
          event_uuid_start: eventIDStart,
          visitor_uuid_start: UUIDStart,
          setEventID: setEventID,
          setUUID: setUUID,
          setEventIDStart: setEventIDStart,
          setUUIDStart: setUUIDStart,
        }}
      >
        <AnalyticsHandle pathname={pathname} />
      </AnalyticsContextProvider>
    </>
  );
};
export default AnalyticsReact;
