<?php
declare(strict_types=1);
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('CDN-Cache-Control: no-store');
header('Pragma: no-cache');
header('X-Next90sim-Build: 173');
readfile(__DIR__.'/index.html');
