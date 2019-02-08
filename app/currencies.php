<?php
//unix time rounded down to days
$time = floor(time() / 86400);

//unix time of last update rounded down to days. If file doesn't exist, then zero
$lastUpdate = 0;
if(file_exists('currencies.json')) {
	$lastUpdate = floor(filemtime('currencies.json') / 86400);
}

//send the JSON that's already here
if($time === $lastUpdate) {
	echo file_get_contents('currencies.json');
}

//or get a new JSON, save it and send it
//uses the free API for currency exchange rates: https://fixer.io/
else {
	//your personal API Key is stored in this file. I suggest denying access to it (e.g. using .htaccess)
	if(file_exists('API_key')) {
		$key = file_get_contents('API_key');
	
		$data = file_get_contents('http://data.fixer.io/api/latest?access_key='.$key);
		file_put_contents('currencies.json', $data);
		//counter of requests, uncomment if you want it:
		//touch('foobar');file_put_contents('foobar', (int)file_get_contents('foobar') + 1);
		echo $data;
	}
}
