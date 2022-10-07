<?php
$config = json_decode(file_get_contents(__DIR__ . "/../../config.json"), true);
echo "src/perfer/perfer.php:config.json:" . json_encode($config) . PHP_EOL;
$cmd = "tar -czvf " . $config["logDir"] . "/" . system("/userroot/mbin/getTimeUs -f") . ".tar.gz -C " . $config["logDir"] . " latest.log";
echo "src/perfer/perfer.php:running command:" . $cmd . PHP_EOL;
system($cmd);
$deleteFile = $config["logDir"] . "/latest.log";
echo "src/perfer/perfer.php:deleting file:" . $deleteFile . PHP_EOL;
unlink($deleteFile);
