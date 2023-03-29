/*
 * @copyright   Copyright (C) 2022 AesirX. All rights reserved.
 * @license     GNU General Public License version 3, see LICENSE.
 */

import React, { ReactNode, useState } from 'react';

interface Props {
  children?: ReactNode;
}

interface AnalyticsContextType {
  event_uuid: string;
  visitor_uuid: string;
  event_uuid_start: string;
  visitor_uuid_start: string;
  setEventID: Function;
  setUUID: Function;
  setEventIDStart: Function;
  setUUIDStart: Function;
}

export const AnalyticsContext = React.createContext<AnalyticsContextType>({
  event_uuid: undefined,
  visitor_uuid: undefined,
  event_uuid_start: undefined,
  visitor_uuid_start: undefined,
  setEventID: undefined,
  setUUID: undefined,
  setEventIDStart: undefined,
  setUUIDStart: undefined,
});

const AnalyticsContextProvider: React.FC<Props> = ({ children }) => {
  const [eventID, setEventID] = useState();
  const [UUID, setUUID] = useState();
  const [eventIDStart, setEventIDStart] = useState();
  const [UUIDStart, setUUIDStart] = useState();
  return (
    <AnalyticsContext.Provider
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
      {children}
    </AnalyticsContext.Provider>
  );
};

export { AnalyticsContextProvider };
