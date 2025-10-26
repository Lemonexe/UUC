import { createContext, useCallback, useContext, useState } from 'react';
import { type Lang, setUUCLang } from 'uuc-core';
import { ps } from './state';
import type { Dispatch, PropsWithChildren } from 'react';

type LangContextType = { lang: Lang; setLang: Dispatch<Lang> };
// default value will be overridden by provider
export const LangContext = createContext<LangContextType>({ lang: ps.lang, setLang: setUUCLang });

export const LangContextProvider = ({ children }: PropsWithChildren) => {
	const [lang, setLangInner] = useState<Lang>(ps.lang);
	const setLang = useCallback((l: Lang) => {
		ps.lang = l;
		setUUCLang(l);
		setLangInner(l);
	}, []);

	return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
};

export const useLangContext = () => useContext(LangContext);
export const useLang = () => useLangContext().lang;

export const Cz = ({ children }: PropsWithChildren) => (useLang() === 'cz' ? children : null);
export const En = ({ children }: PropsWithChildren) => (useLang() === 'en' ? children : null);

export const trans = (en: string, cz?: string): string => (ps.lang === 'en' ? en : (cz ?? en));
