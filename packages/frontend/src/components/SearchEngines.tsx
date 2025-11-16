import { Cz, En } from '../lang';
import { getCurrentWebAddress } from '../utils';
import type { Route } from '../types';
import type { Dispatch } from 'react';

const currentWebAddress = getCurrentWebAddress();

type SearchEnginesProps = { navigate: Dispatch<Route> };
export const SearchEngines = ({ navigate }: SearchEnginesProps) => (
	<div>
		<a className="fakeLink" onClick={() => navigate('intro')}>
			<Cz>(Jít zpět)</Cz>
			<En>(Go back)</En>
		</a>
		<h4>
			Chrome, Edge, Brave <Cz>apod.</Cz>
			<En>etc.</En>
		</h4>
		<p>
			<Cz>Není třeba nic instalovat, jen provést jednoduché nastavení:</Cz>
			<En>No need to install anything, it can be done in the settings:</En>
		</p>
		<ol>
			<li>
				<Cz>Otevřete jednu z těchto adres dle prohlížeče:</Cz>
				<En>Open one of these addresses depending in browser:</En>
				<br />
				<span className="code">
					chrome://settings/searchEngines
					<br />
					edge://settings/searchEngines
					<br />
					brave://settings/searchEngines
				</span>
			</li>
			<li>
				<Cz>Klepněte na tlačítko Přidat</Cz>
				<En>Click the Add button</En>
			</li>
			<li>
				<Cz>Do pole URL vložte</Cz>
				<En>Insert</En>
				<br />
				<span className="code">{currentWebAddress + '/#%s'}</span>
				<br />
				<Cz>a do zbývajících polí vložte:</Cz>
				<En> into the URL field, and into the other fields insert:</En>
				<br />
				<span className="code">uuc</span>
			</li>
			<li>
				<Cz>Dialog potvrďte.</Cz>
				<En>Confirm the dialog.</En>
			</li>
		</ol>
		<p>
			<Cz>
				Hotovo – právě jste definovali klíčové slovo <i>uuc</i> :-)
				<br />
				Nyní stačí otevřít nový panel, napsat uuc, mezeru, zadat konverzi a stisknout Enter.
				<br />
				Cílové jednotky se zde specifikují znakem &gt; nebo slovy <i>to</i> či <i>into</i>
				<br />
				např. 3.7 kPa &nbsp;&gt;&nbsp; Torr
			</Cz>
			<En>
				Done – you have defined <i>uuc</i> as a keyword :-)
				<br />
				Now you can simply open a new tab, write uuc, space, and write your conversion and press Enter.
				<br />
				Target units are specified by character &gt; or by words <i>to</i> or <i>into</i>
				<br />
				e.g. 3.7 kPa &nbsp;&gt;&nbsp; Torr
			</En>
		</p>
		<h4>Firefox</h4>
		<p>
			<Cz>Zde je to ještě jednodušší, není ani třeba navštívit nastavení.</Cz>
			<En>It&apos;s even easier here, no need to even visit settings.</En>
		</p>
		<ol>
			<li>
				<Cz>Uložte tuto stránku jako novou záložku.</Cz>
				<En>Save this page as a bookmark.</En>
			</li>
			<li>
				<Cz>Pak ji upravte a do pole URL vložte:</Cz>
				<En>Then edit the bookmark and into the URL field, fill:</En>
				<br />
				<span className="code">{currentWebAddress + '/#%s'}</span>
			</li>
			<li>
				<Cz>Do pole Klíčové slovo vložte:</Cz>
				<En>Into the Keyword field, fill in:</En>
				<br />
				<span className="code">uuc</span>
			</li>
		</ol>
		<p>
			<Cz>A funguje to stejně jako ve Chrome</Cz>
			<En>And it works just like in Chrome</En> 🙂
		</p>
	</div>
);
