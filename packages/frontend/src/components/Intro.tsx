import { Cz, En } from '../lang';
import type { Route } from '../types';
import type { Dispatch } from 'react';

type IntroProps = { navigate: Dispatch<Route>; initTutorial: () => void };

export const Intro = ({ navigate, initTutorial }: IntroProps) => (
	<div>
		<Cz>
			<p>
				Ultimate Unit Converter vás vítá!
				<br />
				Pokud jste zde poprvé, {/* prettier-ignore */}
				<b>klikněte <a onClick={initTutorial} className="fakeLink">zde</a> pro spuštění interaktivního tutoriálu</b>
				, kde se dozvíte o hlavních možnostech použití UUC.
			</p>
			<h4>Co je na UUC tak zvláštního?</h4>
			<p>
				Na internetu lze najít mnoho převodníků různých jednotek, avšak žádný, který by byl schopen převádět
				jednotky ve <i>zcela libovolných</i> rozměrech – tedy jako součin a podíl jednotek v různých mocninách.
				S UUC už nebudete muset řešit, kterým číslem násobit či dělit, neboť program pochopí jakýkoliv fyzikální
				výraz a převede jej na libovolnou jednotku s odpovídajícím rozměrem.
			</p>
			<h4>Tipy:</h4>
			<ul>
				<li>
					UUC je možné přidat do prohlížeče jako vyhledávač a mít jej tak rychle po ruce!{' '}
					<a className="fakeLink" onClick={() => navigate('search')}>
						Návod
					</a>
				</li>
				<li>
					Pokud vám zde chybí vaše oblíbená jednotka či konstanta a rádi byste ji zde viděli,{' '}
					<a href="https://github.com/Lemonexe/UUC/issues/new" target="_blank" rel="noreferrer">
						kontaktujte mě
					</a>
				</li>
				<li>
					Pokud máte nápad na vylepšení této aplikace, neváhejte{' '}
					<a href="https://github.com/Lemonexe/UUC/issues/new" target="_blank" rel="noreferrer">
						mě kontaktovat
					</a>
				</li>
				<li>
					Pokud sami programujete a máte zájem o zdrojový kód, navštivte{' '}
					<a href="https://github.com/Lemonexe/UUC" target="_blank" rel="noreferrer">
						Github repozitář
					</a>
					{/*	TODO link to npm */}
				</li>
			</ul>
		</Cz>
		<En>
			<p>
				Ultimate Unit Converter welcomes you!
				<br />
				If you&apos;re here for the first time, {/* prettier-ignore */}
				<b>click <a onClick={initTutorial} className="fakeLink">here</a> to open an interactive tutorial</b>{' '}
				that will show you the most useful features of UUC.
			</p>
			<h4>What is so special about UUC?</h4>
			<p>
				While you can find lots of different converters for various units, there isn&apos;t one that could
				convert units <i>in any</i> dimension <i>whatsoever</i> – meaning a product of several units in various
				powers. With UUC you&apos;ll never again have to ponder, which number you&apos;re supposed to multiply
				or divide with, because this program will understand any physical quantity expression and convert it to
				a unit of choice with corresponding dimension.
			</p>
			<h4>Tips:</h4>
			<ul>
				<li>
					Now you can add UUC to your browser as a search engine so as to quickly access it!{' '}
					<a className="fakeLink" onClick={() => navigate('search')}>
						Instructions
					</a>
				</li>
				<li>
					If you are missing your favorite unit or constant and would like to see it here, you can{' '}
					<a href="https://github.com/Lemonexe/UUC/issues/new" target="_blank" rel="noreferrer">
						contact me
					</a>
				</li>
				<li>
					If you have an idea how to enhance the application, you can{' '}
					<a href="https://github.com/Lemonexe/UUC/issues/new" target="_blank" rel="noreferrer">
						contact me
					</a>
				</li>
				<li>
					If you are a programmer interested in the source code, see the{' '}
					<a href="https://github.com/Lemonexe/UUC" target="_blank" rel="noreferrer">
						Github repository
					</a>
				</li>
			</ul>
		</En>
	</div>
);
