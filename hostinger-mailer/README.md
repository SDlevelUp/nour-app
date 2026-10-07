# Hostinger email relay for Nour

This small PHP endpoint sends Convex Auth one-time codes through the existing
Hostinger mailbox. The mailbox password and shared API key stay outside the
public web directory and out of this repository.

## Hostinger setup

1. Use a PHP 8.0+ website on Hostinger. Upload the contents of this directory
   into a folder such as `public_html/nour-mailer`.
2. Install the Composer dependency in that folder, either over Hostinger SSH or
   locally before uploading:

   ```sh
   composer install --no-dev --optimize-autoloader
   ```

   The deployed folder must contain `vendor/autoload.php`.
3. Copy `config.example.php` to a file named `nour-mailer-secrets.php` in the
   domain directory **outside** `public_html`. For the example upload path above,
   this is the parent of `public_html`. Replace the placeholders with:
   - a long random API key (generate one with
     `php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"`);
   - the full mailbox username `contact@sdlevelup.fr`;
   - that mailbox's password;
   - the sender display name `Nour`.

   Never upload the real secrets file into `public_html` or commit it to Git.
   The endpoint expects it at the path described above.
4. In the Convex deployment used by the app, set the HTTPS URL of the uploaded
   endpoint and the same API key. For example:

   ```sh
   npx convex env set NOUR_MAILER_URL https://sdlevelup.fr/nour-mailer/send-otp.php
   npx convex env set NOUR_MAILER_API_KEY '<same-random-api-key>'
   ```

   These are server-side Convex variables, not Vite variables. Do not put the
   API key or mailbox password in frontend configuration.
5. Test by requesting a sign-in code from Nour. The email should arrive from
   `Nour <contact@sdlevelup.fr>`.

The endpoint accepts only authenticated JSON `POST` requests containing an
email address and a six-digit code, and limits each recipient to three sends
per 15 minutes. It uses Hostinger SMTP over SSL on port 465 and does not return
SMTP error details to callers.
