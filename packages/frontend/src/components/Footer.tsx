import githubLogo from '../assets/GitHub-Mark-32px.png';
import { Cz, En } from '../lang';

export const Footer = () => (
	<>
		<div id="footer">
			<Cz>
				Vytvořil <a href="https://jira.zby.cz/">Jiří Zbytovský</a> v letech 2017-2025 pod{' '}
				<a href="https://github.com/Lemonexe/UUC/blob/master/LICENSE">licencí MIT</a>
			</Cz>
			<En>
				Made by <a href="https://jira.zby.cz/">Jiří Zbytovský</a> in years 2017-2025 under{' '}
				<a href="https://github.com/Lemonexe/UUC/blob/master/LICENSE">MIT License</a>
			</En>
		</div>

		<a id="githubLogo" href="https://github.com/Lemonexe/UUC" target="_blank" title="Github" rel="noreferrer">
			<img src={githubLogo} />
		</a>
	</>
);
