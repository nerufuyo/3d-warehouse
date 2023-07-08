// Create react context
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { SheetSettings } from 'types/spreadsheets/settings';

const initialSettings = {
  isMaintenance: false,
  siteName: '',
  siteDescription: '',
  titleTemplate: '',
};
const WebSettingsContext = createContext<SheetSettings>(initialSettings);

export const useWebSettings = () => useContext(WebSettingsContext);

export const WebSettingsProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: SheetSettings;
}) => {
  const [webSettings, setWebSettings] =
    useState<SheetSettings>(initialSettings);

  useEffect(() => {
    setWebSettings(value);
  }, [value]);

  return (
    <WebSettingsContext.Provider value={webSettings}>
      {children}
    </WebSettingsContext.Provider>
  );
};
