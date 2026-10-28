<?php

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

function enforceRecipientRateLimit(string $recipient): void
{
    $rateLimitFile = sys_get_temp_dir() . '/rawdah-otp-' .
        hash('sha256', strtolower($recipient)) . '.json';
    $file = fopen($rateLimitFile, 'c+');
    if ($file === false || !flock($file, LOCK_EX)) {
        if (is_resource($file)) {
            fclose($file);
        }
        error_log('Rawdah mail relay could not access its rate-limit storage.');
        respond(503, ['ok' => false, 'error' => 'relay_unavailable']);
    }

    rewind($file);
    $storedTimestamps = stream_get_contents($file);
    $timestamps = $storedTimestamps === false || $storedTimestamps === ''
        ? []
        : json_decode($storedTimestamps, true);
    if (!is_array($timestamps)) {
        flock($file, LOCK_UN);
        fclose($file);
        error_log('Rawdah mail relay rate-limit storage is invalid.');
        respond(503, ['ok' => false, 'error' => 'relay_unavailable']);
    }

    $cutoff = time() - 900;
    $recentTimestamps = array_values(array_filter(
        $timestamps,
        static fn ($timestamp): bool =>
            is_int($timestamp) && $timestamp > $cutoff,
    ));
    if (count($recentTimestamps) >= 3) {
        flock($file, LOCK_UN);
        fclose($file);
        respond(429, ['ok' => false, 'error' => 'rate_limit_exceeded']);
    }

    $recentTimestamps[] = time();
    $encodedTimestamps = json_encode($recentTimestamps);
    rewind($file);
    $written = ftruncate($file, 0) &&
        $encodedTimestamps !== false &&
        fwrite($file, $encodedTimestamps) !== false &&
        fflush($file);
    flock($file, LOCK_UN);
    fclose($file);

    if (!$written) {
        error_log('Rawdah mail relay could not update rate-limit storage.');
        respond(503, ['ok' => false, 'error' => 'relay_unavailable']);
    }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 4096) {
    respond(413, ['ok' => false, 'error' => 'request_too_large']);
}

$configPath = dirname(__DIR__, 2) . '/rawdah-mailer-secrets.php';
if (!is_file($configPath)) {
    error_log('Rawdah mail relay is missing its private configuration file.');
    respond(503, ['ok' => false, 'error' => 'relay_not_configured']);
}

$config = require $configPath;
if (
    !is_array($config) ||
    !isset($config['apiKey'], $config['smtpUsername'], $config['smtpPassword']) ||
    !is_string($config['apiKey']) ||
    !is_string($config['smtpUsername']) ||
    !is_string($config['smtpPassword']) ||
    $config['apiKey'] === '' ||
    $config['smtpUsername'] === '' ||
    $config['smtpPassword'] === ''
) {
    error_log('Rawdah mail relay private configuration is invalid.');
    respond(503, ['ok' => false, 'error' => 'relay_not_configured']);
}

$authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$providedApiKey = str_starts_with($authorization, 'Bearer ')
    ? substr($authorization, 7)
    : '';
if (!hash_equals($config['apiKey'], $providedApiKey)) {
    respond(401, ['ok' => false, 'error' => 'unauthorized']);
}

$contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
if ($contentType !== 'application/json') {
    respond(415, ['ok' => false, 'error' => 'unsupported_media_type']);
}

$requestBody = file_get_contents('php://input');
if ($requestBody === false || strlen($requestBody) > 4096) {
    respond(400, ['ok' => false, 'error' => 'invalid_request']);
}

try {
    $request = json_decode($requestBody, true, 8, JSON_THROW_ON_ERROR);
} catch (JsonException) {
    respond(400, ['ok' => false, 'error' => 'invalid_json']);
}

$recipient = is_array($request) ? ($request['to'] ?? null) : null;
$otp = is_array($request) ? ($request['otp'] ?? null) : null;
if (
    !is_string($recipient) ||
    filter_var($recipient, FILTER_VALIDATE_EMAIL) === false ||
    !is_string($otp) ||
    preg_match('/^\d{6}$/', $otp) !== 1
) {
    respond(400, ['ok' => false, 'error' => 'invalid_request']);
}

enforceRecipientRateLimit($recipient);

require_once __DIR__ . '/vendor/autoload.php';

try {
    $mailer = new PHPMailer(true);
    $mailer->isSMTP();
    $mailer->Host = 'smtp.hostinger.com';
    $mailer->SMTPAuth = true;
    $mailer->Username = $config['smtpUsername'];
    $mailer->Password = $config['smtpPassword'];
    $mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mailer->Port = 465;
    $mailer->CharSet = PHPMailer::CHARSET_UTF8;
    $mailer->Timeout = 15;
    $mailer->setFrom(
        $config['smtpUsername'],
        is_string($config['fromName'] ?? null) ? $config['fromName'] : 'Rawdah',
    );
    $mailer->addAddress($recipient);
    $mailer->isHTML(true);
    $mailer->Subject = 'Votre code de connexion Rawdah';
    $escapedOtp = htmlspecialchars($otp, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $mailer->Body =
        '<p>Voici votre code de connexion à Rawdah :</p>' .
        '<p style="font-size:28px;font-weight:bold;letter-spacing:6px">' .
        $escapedOtp .
        '</p><p>Ce code expire dans 15 minutes. Si vous n’êtes pas à l’origine ' .
        'de cette demande, vous pouvez ignorer cet e-mail.</p>';
    $mailer->AltBody =
        "Voici votre code de connexion à Rawdah : {$otp}\n\n" .
        'Ce code expire dans 15 minutes. Si vous n’êtes pas à l’origine ' .
        'de cette demande, vous pouvez ignorer cet e-mail.';
    $mailer->send();
} catch (Throwable $error) {
    error_log('Rawdah mail relay failed to send an OTP email: ' . $error->getMessage());
    respond(502, ['ok' => false, 'error' => 'email_delivery_failed']);
}

respond(200, ['ok' => true]);
