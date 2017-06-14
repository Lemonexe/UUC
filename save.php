<?php
$cas = time();
$ip = $_SERVER['REMOTE_ADDR'];
$code = 400;

$values = json_decode(file_get_contents('php://input'));
touch('suggestions');

if($values) {
	$arr = [];

	//get the database or initiate it. Structure of the database = array of associative arrays: {time, IP, name, id, v, k, note, prefix, SI, constant};
	$file = json_decode(file_get_contents('suggestions'), true);
	if($file) {
		$arr = $file;
	}

	//how many times this IP posted today
	$thisIPtoday = 0;
	foreach($arr as $value) {
		if($value[1] === $ip && $cas - $value[0] < 86400) {
			$thisIPtoday++;
		}
	}

	//convert to associative array
	$new = array(
		'time' => $cas,
		'ip' => $ip,
		'name' => $values[0],
		'id' => $values[1],
		'v' => $values[2],
		'k' => $values[3],
		'note' => $values[4],
		'constant' => $values[7]
	);
	if($new['constant']) {
		$new['id'] = '$'.$new['id'];
	}
	else {
		$new['prefix'] = $values[5];
		$new['SI'] = $values[6];
	}

	//check input. Errors: string lengths = 400, too many posts for today = 429.
	if(
		strlen($new['name']) > 0 &&
		strlen($new['name']) < 200 &&
		strlen($new['id']) < 10 &&
		strlen($new['v']) < 30 &&
		strlen($new['k']) < 30 &&
		strlen($new['note']) < 400
	) {
		if($thisIPtoday < 50) {
			$code = 200;
			array_push($arr, $new);
			file_put_contents('suggestions', json_encode($arr));
		}
		else {$code = 429;}
	}
}

http_response_code($code);
