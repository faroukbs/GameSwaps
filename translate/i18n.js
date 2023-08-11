import 'intl-pluralrules'; // Import the polyfill

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import combinedTranslations from './combinedTranslations';

i18n
  .use(initReactI18next)
  .init({
    lng: 'ar',
    fallbackLng: 'en', 
    resources: combinedTranslations, 
  });

export default i18n;
