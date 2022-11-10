import React, { useState } from 'react';

import { AnalyticsContextProvider } from './AnalyticsContextProvider';
import AnalyticsHandle from './handle';

const AnalyticsNext = ({ router }) => {
  const [eventID, setEventID] = useState();
  const [UUID, setUUID] = useState();
  const [eventIDStart, setEventIDStart] = useState();
  const [UUIDStart, setUUIDStart] = useState();
  return (
    <>
      <AnalyticsContextProvider
        value={{
          event_id: eventID,
          uuid: UUID,
          event_id_start: eventIDStart,
          uuid_start: UUIDStart,
          setEventID: setEventID,
          setUUID: setUUID,
          setEventIDStart: setEventIDStart,
          setUUIDStart: setUUIDStart,
        }}
      >
        <AnalyticsHandle router={router}></AnalyticsHandle>
      </AnalyticsContextProvider>
    </>
  );
};
export default AnalyticsNext;
