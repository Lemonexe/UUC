import czFlag from '../assets/CZ.png';
import enFlag from '../assets/EN.png';
import { useLangContext } from '../lang';

export const LangPicker = () => {
	const { setLang } = useLangContext();

	return (
		<div id="lang">
			<img src={czFlag} onClick={() => setLang('cz')} title="Czech" />
			<img src={enFlag} onClick={() => setLang('en')} title="English" />
		</div>
	);
};
