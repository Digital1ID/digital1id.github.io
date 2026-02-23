<?php
$html = file_get_contents('https://api-soccer.thai-play.com/api/v4/iptv/livescore/now?token=JF6pHMnpVCRUeEsSqAAjTWA4GbGhMrpD');
$html = mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');
$dom = new DOMDocument();
libxml_use_internal_errors(true);
$dom->loadHTML($html);
libxml_clear_errors();
$xpath = new DOMXPath($dom);

$result = [
    "matches" => [],
    "debugLog" => []
];
$usedUrls = [];

$containers = $xpath->query("//div[contains(@class, 'row gy-3')]");
foreach ($containers as $container) {
    // สถานะการแข่งขัน
    $statusNode = $xpath->query(".//div[contains(@class, 'col-lg-1')]//div", $container)->item(0);
    $statusText = $statusNode ? trim($statusNode->textContent) : '';

    // ถ้าเป็น FT → เก็บ log แล้วข้าม
    if (strtoupper($statusText) === 'FT') {
        $homeNode = $xpath->query(".//div[contains(@class, 'text-end')]//p", $container)->item(0);
        $homeTeam = $homeNode ? trim($homeNode->textContent) : 'ทีมเหย้า';
        $awayNode = $xpath->query(".//div[contains(@class, 'text-start')]//p", $container)->item(0);
        $awayTeam = $awayNode ? trim($awayNode->textContent) : 'ทีมเยือน';
        $result["debugLog"][] = "ข้ามคู่ที่จบแล้ว (FT): $homeTeam vs $awayTeam";
        continue;
    }

    // เวลาแข่งขัน
    $matchTime = preg_replace('/(\d{1,2}):(\d{2})/', '$1.$2', $statusText);

    // ทีมเหย้า
    $homeNode = $xpath->query(".//div[contains(@class, 'text-end')]//p", $container)->item(0);
    $homeTeam = $homeNode ? trim($homeNode->textContent) : 'ทีมเหย้า';

    // ทีมเยือน
    $awayNode = $xpath->query(".//div[contains(@class, 'text-start')]//p", $container)->item(0);
    $awayTeam = $awayNode ? trim($awayNode->textContent) : 'ทีมเยือน';

    // ชื่อลีก
    $leagueNode = $xpath->query("preceding::strong[contains(@class, 'text-uppercase')][1]", $container)->item(0);
    $leagueFull = $leagueNode ? str_replace('|', ':', trim($leagueNode->textContent)) : 'ไม่ระบุลีก';

    // วันที่
    $dateNode = $xpath->query("preceding::b[contains(@class, 'fs-4')][1]", $container)->item(0);
    $thaiDate = $dateNode ? trim($dateNode->textContent) : date('d/m/Y');

    // สตรีมทั้งหมด
    $streamNodes = $xpath->query(".//img[contains(@class, 'iam-list-tv')]", $container);
    foreach ($streamNodes as $stream) {
        $channel = $stream->getAttribute('alt');
        $rawUrl = $stream->getAttribute('data-url');
        $logo = $stream->getAttribute('src');
        $url = str_replace(':443', '', $rawUrl);
        $url = str_replace('/dooballfree-com/', '/do-ball.com/', $url);

        if (!$url || isset($usedUrls[$url])) {
            continue;
        }
        $usedUrls[$url] = true;

        $result["matches"][] = [
            "homeTeam" => $homeTeam,
            "awayTeam" => $awayTeam,
            "date" => $thaiDate,
            "time" => $matchTime,
            "league" => $leagueFull,
            "channel" => $channel,
            "logo" => $logo,
            "url" => $url,
            "status" => $statusText, // เพิ่มสถานะการแข่งขัน
            "options" => [
                "http-origin" => "https://demo-live.siamzeed.com",
                "http-referrer" => "https://demo-live.siamzeed.com/",
                "http-user-agent" => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36"
            ]
        ];
    }
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
