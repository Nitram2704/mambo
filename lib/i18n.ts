import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import es from '../locales/es.json';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import pt from '../locales/pt.json';

const resources = {
    es: { translation: es },
    en: { translation: en },
    fr: { translation: fr },
    pt: { translation: pt },
};

const getDeviceLanguage = () => {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
        const lang = locales[0].languageCode;
        if (lang && resources.hasOwnProperty(lang)) {
            return lang;
        }
    }
    return 'es';
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: getDeviceLanguage(),
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false,
        },
    });

export const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
};

export default i18n;
