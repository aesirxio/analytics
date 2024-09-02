import React, { createContext, useContext } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import common_dk from '../translations/dk/common.json';
import common_en from '../translations/en/common.json';
import common_es from '../translations/es/common.json';
import common_hr from '../translations/hr/common.json';
import common_th from '../translations/th/common.json';
import common_ua from '../translations/ua/common.json';
import common_vn from '../translations/vi/common.json';
import common_fr from '../translations/fr/common.json';
import common_nl from '../translations/nl/common.json';

const defaultLanguages: any = {
  en: {
    title: 'English',
    translation: common_en,
  },
  da: {
    title: 'Dansk',
    translation: common_dk,
  },
  vi: {
    title: 'Tiếng Việt',
    translation: common_vn,
  },
  th: {
    title: 'ภาษาไทย',
    translation: common_th,
  },
  hr: {
    title: 'Hrvatski',
    translation: common_hr,
  },
  uk: {
    title: 'Yкраїнська',
    translation: common_ua,
  },
  es: {
    title: 'Español',
    translation: common_es,
  },
  fr: {
    title: 'Français',
    translation: common_fr,
  },
  nl: {
    title: 'Nederlands',
    translation: common_nl,
  },
};

interface IContext {
  listLanguages: any;
}

const I18NextContext = createContext<IContext>({
  listLanguages: [],
});

const AesirXI18nextProvider = ({
  children,
  appLanguages,
}: {
  children: React.ReactNode;
  appLanguages: any;
}) => {
  const listLanguages: any = [];

  if (!i18n.isInitialized) {
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources: defaultLanguages,
        lng: (typeof window !== 'undefined' && document.documentElement.lang) || 'en',
        fallbackLng: 'en',
        debug: !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
      });
  }

  Object.entries(appLanguages).forEach(([key, resource]) => {
    i18n.addResourceBundle(key, 'translation', resource);
    listLanguages.push({ label: defaultLanguages[key].title, value: key });
  });

  return (
    <I18NextContext.Provider value={{ listLanguages }}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </I18NextContext.Provider>
  );
};

const useI18nextContext = () => useContext(I18NextContext);

const withI18nextContext = (Component: any) => (props: any) => {
  return <Component {...props} {...useI18nextContext()} />;
};

export { AesirXI18nextProvider, useI18nextContext, withI18nextContext };
