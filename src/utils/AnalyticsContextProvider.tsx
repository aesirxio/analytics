/*
 * @copyright   Copyright (C) 2022 AesirX. All rights reserved.
 * @license     GNU General Public License version 3, see LICENSE.
 */

import React, { Dispatch, ReactNode, SetStateAction, useState } from 'react';

interface Props {
  children?: ReactNode;
}

interface AnalyticsContextType {
  visitor_uuid: string;
  event_uuid_start: string;
  visitor_uuid_start: string;
  setUUID: Dispatch<SetStateAction<string>>;
  setEventIDStart: Dispatch<SetStateAction<string>>;
  setUUIDStart: Dispatch<SetStateAction<string>>;
}

export const AnalyticsContext = React.createContext<AnalyticsContextType>({
  visitor_uuid: undefined,
  event_uuid_start: undefined,
  visitor_uuid_start: undefined,
  setUUID: undefined,
  setEventIDStart: undefined,
  setUUIDStart: undefined,
});

const AnalyticsContextProvider: React.FC<Props> = ({ children }) => {
  const [UUID, setUUID] = useState();
  const [eventIDStart, setEventIDStart] = useState();
  const [UUIDStart, setUUIDStart] = useState();
  return (
    <AnalyticsContext.Provider
      value={{
        visitor_uuid: UUID,
        event_uuid_start: eventIDStart,
        visitor_uuid_start: UUIDStart,
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
