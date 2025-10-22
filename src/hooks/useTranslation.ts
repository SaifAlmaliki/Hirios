import { useLanguage } from '@/contexts/LanguageContext';

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export const useTranslation = () => {
  const { language, setLanguage, toggleLanguage, translations, isRTL } = useLanguage();

  // Helper function to get nested translation value
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  // Helper function to get array translations
  const tArray = (key: string): unknown[] => {
    const keys = key.split('.');
    let value: unknown = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return [];
      }
    }

    return Array.isArray(value) ? value : [];
  };

  return {
    t,
    tArray,
    language,
    setLanguage,
    toggleLanguage,
    isRTL,
  };
};
