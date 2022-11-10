import React, { useState } from 'react';

import { AnalyticsContextProvider } from './AnalyticsContextProvider';
import AnalyticsHandle from './handle';
const AnalyticsReact = ({ pathname, children }) => {
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
        <AnalyticsHandle pathname={pathname}>{children}</AnalyticsHandle>
      </AnalyticsContextProvider>
    </>
  );
};
export default AnalyticsReact;
