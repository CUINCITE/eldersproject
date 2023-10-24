-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Czas generowania: 14 Lis 2022, 18:51
-- Wersja serwera: 5.7.34
-- Wersja PHP: 8.1.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Baza danych: `uhomvc8`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `client_mailing`
--

CREATE TABLE `client_mailing` (
  `id` int(11) NOT NULL,
  `slug` varchar(256) COLLATE utf8_polish_ci NOT NULL,
  `subject_PL` varchar(256) COLLATE utf8_polish_ci NOT NULL,
  `subject_EN` varchar(256) COLLATE utf8_polish_ci NOT NULL,
  `message_PL` text COLLATE utf8_polish_ci NOT NULL,
  `message_EN` text COLLATE utf8_polish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

--
-- Zrzut danych tabeli `client_mailing`
--

INSERT INTO `client_mailing` (`id`, `slug`, `subject_PL`, `subject_EN`, `message_PL`, `message_EN`) VALUES
(1, 'register_confirmation', 'Potwierdź rejestrację w serwisie {{website}}', '{{website}} - confirm you registration', '<p>Potwierdź swój e-mail klikając w poniższy link:</p>\r\n\r\n<p><pre><a href=\"{{url}}\">{{url}}</a></pre></p>\r\n\r\n<p>Dziękujemy,\r\n<br>{{website}}\r\n</p>\r\n\r\n<small>Prosimy nie odpowiadać na tę wiadomość, została wysłana automatycznie.</small>', '<p>Please, verify that this email address belongs to you, by clicking the link below:</p>\r\n\r\n<p><pre><a href=\"{{url}}\">{{url}}</a></pre></p>\r\n\r\n<p>Thank you, \r\n<br>{{website}}</p>\r\n\r\n<small>This message is generated automatically, please do not reply.</small>'),
(2, 'password_change', 'Zmiana hasła w portalu {{website}}', '{{website}} - Password Reset', '<p>Witaj,</p>\r\n\r\n<p>Otrzymaliśmy prośbę o zresetowania hasła w naszym portalu.</p>\r\n\r\n<p>Kliknij ten link, jeżeli chcesz zmienić hasło:</p>\r\n\r\n<p><pre><a href=\"{{url}}\">{{url}}</a></pre></p>\r\n\r\n<p>Jeżeli zmiana hasła nie jest potrzebna, prosimy zignorować tę wiadomość.</p>\r\n\r\n<p>Dziękujemy,<br>{{website}}.</p>\r\n\r\n<small>Prosimy nie odpowiadać na tę wiadomość, została wysłana automatycznie.</small>\r\n', '<p>Hello,</p>\r\n<p>We have received a request for a password reset.</p>\r\n<p>Click the link below, if you would like to change your password:</p>\r\n<p>{{url}}</p>\r\n\r\n<p>Thank you,<br>{{website}}</p>\r\n\r\n<small>If you did not request a password reset, please ignore this message.</small>'),
(3, 'newsletter_confirmation', 'Potwierdzenie subskrypcji newslettera w serwisie {{website}}', '{{website}}. Newsletter confirmation.', 'Witamy,\r\n\r\nTwój adres e-mail został zgłoszony do newslettera portalu {{website}}.\r\n\r\nProsimy o potwierdzenie tego faktu klikając w poniższy link:\r\n\r\n{{url}}\r\n\r\npozdrawiamy,\r\n{{website}}\r\n\r\nJeżeli Twój adres nie został zgłoszony do naszego newslettera przez Ciebie, prosimy, zignoruj tę wiadomość.', 'Hello,\r\n\r\nThank you very much for registering for our Newsletter.\r\n\r\nClick below to confirm your registration.\r\n\r\n{{url}}\r\n\r\nKind regards, \r\n{{website}'),
(21, 'account_remove_request', 'Potwierdź usunięcie konta w {{website}}', 'Account removal in {{website}}', '<p>Otrzymaliśmy prośbę o usunięcie konta w naszym serwisie.</p>\r\n\r\n<p>Potwierdź klikając w poniższy link:\r\n<br>\r\n<pre><a href=\"{{url_remove}}\">{{url_remove}}</a><pre>\r\n</p>\r\n<p><b>Operacja nie będzie mogła zostać cofnięta.</b></p>\r\n\r\n<p>Dziękujemy,\r\n<br>{{website}}\r\n</p<\r\n<small>Prosimy nie odpowiadać na tę wiadomość, została wysłana automatycznie.</small>', '<p>Please, verify that you would like to permanently remove your account.</p>\r\n<p>\r\n<pre><a href=\"{{url_remove}}\">{{url_remove}}</a></pre></p>\r\n\r\n<p>Thank you, \r\n<br>{{website}}\r\n</p>\r\n<small>\r\nThis message is generated automatically, please do not reply.</small>'),
(23, 'gdpr_expiry_alert', 'Ważna akcja dotycząca Twojego konta w {{website}}', '{{website}} - GDPR expiration alert', '<p>Witaj,</p>\r\n\r\n<p>Za {{days}} dni kończy się Twoja zgoda na okres przetwarzania danych w naszym portalu.</p>\r\n\r\n<p>Kliknij ten link, jeżeli chcesz przedłużyć ważność swojego konta o następne {{days_agree}} dni:</p>\r\n\r\n<p><pre><a href=\"{{url}}\">{{url}}</a></pre></p>\r\n\r\n<p>Jeżeli, nie wyrazisz zgody Twoje konta i wszystkie powiązanie z nim dane zostaną zanimizowane.</p>\r\n\r\n<p>Dziękujemy,<br>{{website}}.</p>\r\n\r\n<small>Prosimy nie odpowiadać na tę wiadomość, została wysłana automatycznie.</small>', '<p>Hello,</p>\r\n<p>Your account in our website will expire soon.</p>\r\n<p>Please, click the link below, if you would like to renew your account for another {{days_agree}} days:</p>\r\n<p>{{url}}</p>\r\n<p>In case of on action your account and all the data connected with it will be anonimized.</p>\r\n\r\n<p>Thank you,<br>{{website}}</p>\r\n\r\n<small>This is automatic message. Don\'t answer to it.</small>'),
(24, 'gdpr_remove_information', 'Ważna akcja dotycząca Twojego konta w {{website}}', '{{website}} - GDPR expiration alert', '<p>Witaj,</p>\r\n\r\n<p>Informujemy, iż Twoje konto w naszym portalu oraz wszystkie dane z nim powiązane zostały zanonimizowane.</p>\r\n\r\n<p>Dziękujemy,<br>{{website}}.</p>\r\n\r\n<small>Prosimy nie odpowiadać na tę wiadomość, została wysłana automatycznie.</small>', '<p>Hello,</p>\r\n<p>Your account in our website has been removed and all the data connected with it have been anonimized.</p>\r\n\r\n<p>Thank you,<br>{{website}}</p>\r\n\r\n<small>This is automatic message. Don\'t answer to it.</small>'),
(25, 'gdpr_expiry_information', 'Ważna akcja dotycząca Twojego konta w {{website}}', '{{website}} - GDPR expiration alert', '<p>Witaj,</p>\r\n\r\n<p>Informujemy, iż z uwagi na brak przedłużenia zgody na przetwarzanie danych osobowych Twoje konto w naszym portalu oraz wszystkie dane z nim powiązane zostały zanonimizowane.</p>\r\n\r\n<p>Dziękujemy,<br>{{website}}.</p>\r\n\r\n<small>Prosimy nie odpowiadać na tę wiadomość, została wysłana automatycznie.</small>', '<p>Hello,</p>\r\n<p>Due to expiration of GPDR agreement, your account in our website has been removed and all the data connected with it have been anonimized.</p>\r\n\r\n<p>Thank you,<br>{{website}}</p>\r\n\r\n<small>This is automatic message. Don\'t answer to it.</small>'),
(28, 'contact', 'Wiadomość z portalu {{website}}', 'Wiadomość z portalu {{website}}', '<p>Witaj,</p>\r\n\r\n<p>Wysłano wiadomość za pośrednictwem portalu Zabytek.pl.</p>\r\n\r\n<p>Nadawca: {{name}} ({{email}})\r\n{% if company %}<br>Firma: {{company}}{% endif %}\r\n<br>Temat: {{subject}}\r\n</p>\r\n<p>Wiadomość:\r\n<br>{{message|nl2br}}\r\n</p>\r\n\r\n<small>Prosimy nie odpowiadać na tę wiadomość, została wysłana automatycznie.</small>', '<p>Witaj,</p>\r\n\r\n<p>Wysłano wiadomość za pośrednictwem portalu Zabytek.pl.</p>\r\n\r\n<p>Nadawca: {{name}} ({{email}})\r\n{% if company %}<br>Firma: {{company}}{% endif %}\r\n<br>Temat: {{subject}}\r\n</p>\r\n<p>Wiadomość:\r\n<br>{{message|nl2br}}\r\n</p>\r\n\r\n<small>Prosimy nie odpowiadać na tę wiadomość, została wysłana automatycznie.</small>');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `client_users`
--

CREATE TABLE `client_users` (
  `id` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `surname` varchar(256) NOT NULL,
  `email` varchar(256) NOT NULL,
  `uid` varchar(64) NOT NULL,
  `newsletter` tinyint(4) NOT NULL,
  `status` enum('submitted','confirmed','disabled','anonimized') NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lang` enum('pl','en') NOT NULL DEFAULT 'pl',
  `password` varchar(256) NOT NULL,
  `key_confirm` varchar(64) NOT NULL,
  `salt` varchar(32) NOT NULL,
  `google_id` varchar(256) NOT NULL,
  `facebook_id` varchar(256) NOT NULL,
  `epuap_id` varchar(256) NOT NULL,
  `key_remove` varchar(64) NOT NULL,
  `gdpr_expiration_date` date NOT NULL,
  `cookie_key` varchar(256) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Zrzut danych tabeli `client_users`
--

INSERT INTO `client_users` (`id`, `name`, `surname`, `email`, `uid`, `newsletter`, `status`, `date`, `lang`, `password`, `key_confirm`, `salt`, `google_id`, `facebook_id`, `epuap_id`, `key_remove`, `gdpr_expiration_date`, `cookie_key`) VALUES
(24, 'Zkt1SnhPRlZFMTBzUStOUW1udTUrdz09', 'MmNIMHVMakZ2Z3hrM250ekZYdFZuQT09', 'NlA1clJDVUt2YnljbDAxQzNZNlhJbjFoRUE3OGVFK2ZKOWtxS1ZJZjhBaz0=', '130f0a850613263961af9f', 0, 'confirmed', '2022-11-12 15:35:38', 'pl', '407d2920a339d129c12a1afd5ee54925', 'OGdYck1UNk9rSzhldWNNTnpxN2Fuejh1eVdKMjNOamtpQ29rSjFFWTZMZz0=', 'b7c', '', '', '', '', '0000-00-00', '0dbee1cd2e643b9d2436aac17d74ccfez3q');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `cms_settings`
--

CREATE TABLE `cms_settings` (
  `id` int(11) NOT NULL,
  `slug` varchar(64) NOT NULL,
  `value` varchar(256) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `cms_users`
--

CREATE TABLE `cms_users` (
  `id` int(11) NOT NULL,
  `login` varchar(100) NOT NULL DEFAULT '',
  `password` varchar(100) NOT NULL DEFAULT '',
  `auth` text NOT NULL,
  `name` varchar(100) NOT NULL DEFAULT '',
  `auth_label` varchar(100) NOT NULL DEFAULT '',
  `locked` tinyint(4) NOT NULL,
  `admin` tinyint(4) NOT NULL,
  `email` varchar(100) NOT NULL,
  `salt` varchar(3) NOT NULL,
  `bad_login` int(11) NOT NULL,
  `hide_menu` tinyint(4) NOT NULL,
  `superadmin` int(11) NOT NULL DEFAULT '0',
  `date_set` datetime NOT NULL,
  `edit_all` int(11) NOT NULL,
  `status` enum('confirmed') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `cms_users_logs`
--

CREATE TABLE `cms_users_logs` (
  `id` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `action` enum('login','edit','remove','logout') NOT NULL,
  `datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `session` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `cms_users_logs_logins`
--

CREATE TABLE `cms_users_logs_logins` (
  `id` int(11) NOT NULL,
  `login` varchar(256) NOT NULL,
  `ip` varchar(256) NOT NULL,
  `datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `success` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `media`
--

CREATE TABLE `media` (
  `id` int(11) NOT NULL,
  `type` enum('image','audio') NOT NULL,
  `uid` varchar(64) NOT NULL,
  `filename_original` varchar(256) NOT NULL,
  `caption_PL` varchar(256) NOT NULL,
  `caption_EN` varchar(256) NOT NULL,
  `model_id_order` int(11) NOT NULL,
  `model_id` int(11) NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `model` enum('banners') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `menu`
--

CREATE TABLE `menu` (
  `id` int(11) NOT NULL,
  `label_PL` varchar(256) NOT NULL,
  `label_EN` varchar(256) NOT NULL,
  `url` varchar(64) NOT NULL,
  `nr` int(11) NOT NULL,
  `active` tinyint(4) NOT NULL,
  `class` varchar(64) NOT NULL,
  `type` enum('main','social','footer') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Zrzut danych tabeli `menu`
--

INSERT INTO `menu` (`id`, `label_PL`, `label_EN`, `url`, `nr`, `active`, `class`, `type`) VALUES
(1, 'Home', '', 'home', 1, 1, '', 'main'),
(2, 'Services', '', 'services', 2, 1, '', 'main'),
(3, 'Facebook', '', '', 0, 1, '', 'social'),
(4, 'Element stopki', '', '', 0, 1, '', 'footer'),
(5, 'Login', '', 'login', 3, 1, 'login', 'main'),
(6, 'Profil', 'Profile', 'profile', 4, 1, 'profile', 'main'),
(7, 'Wyloguj', 'Logout', 'logout', 5, 1, 'logout', 'main');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `pages`
--

CREATE TABLE `pages` (
  `id` int(11) NOT NULL,
  `url` varchar(256) NOT NULL,
  `active` tinyint(4) NOT NULL,
  `slug` varchar(64) NOT NULL,
  `title_PL` varchar(256) NOT NULL,
  `description_PL` varchar(256) NOT NULL,
  `uid` varchar(64) NOT NULL,
  `type` enum('Page','LightboxPage','Home') NOT NULL DEFAULT 'Page',
  `title_EN` varchar(256) NOT NULL,
  `description_EN` varchar(256) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Zrzut danych tabeli `pages`
--

INSERT INTO `pages` (`id`, `url`, `active`, `slug`, `title_PL`, `description_PL`, `uid`, `type`, `title_EN`, `description_EN`) VALUES
(1, 'home', 1, 'home', 'Strona główna', '', '5f514c6ed9777', 'Page', '', ''),
(2, '404', 1, '404', '404', '', '5f514c6d5e851', 'Page', '', ''),
(3, 'login', 1, '', 'Logowanie', '', '619bb02f3abe9', 'Page', 'Login', ''),
(4, 'register', 1, '', 'Rejestracja', '', '619bbb9972bee', 'Page', 'Registration', ''),
(5, 'register-confirmation/%', 1, '', 'Potwierdzenie rejestracji', '', '619cb10ac7e18', 'Page', 'Register confirmation', ''),
(6, 'logout', 1, '', 'Wylogownie', '', '619cc5aa67ff5', 'Page', 'Logout', ''),
(7, 'profile', 1, '', 'Profil', '', '619cc69ccc783', 'Page', 'Profile', ''),
(8, 'password-reset', 1, '', 'Odzyskiwanie hasła', '', '619cce809bcd3', 'Page', 'Password reset', ''),
(9, 'password-reset/%', 1, '', 'Ustawienie nowego hasła', '', '619cd0970bbb6', 'Page', 'Set new password', '');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `pages_modules`
--

CREATE TABLE `pages_modules` (
  `id` int(11) NOT NULL,
  `url` varchar(256) COLLATE utf8_polish_ci NOT NULL,
  `label_PL` varchar(256) COLLATE utf8_polish_ci NOT NULL,
  `active` tinyint(4) NOT NULL,
  `level` int(11) NOT NULL,
  `parent` int(11) NOT NULL,
  `text_PL` text COLLATE utf8_polish_ci NOT NULL,
  `uid` varchar(64) COLLATE utf8_polish_ci NOT NULL,
  `sublabel` varchar(256) COLLATE utf8_polish_ci NOT NULL,
  `type` int(11) NOT NULL,
  `description` varchar(255) COLLATE utf8_polish_ci NOT NULL,
  `params` varchar(256) COLLATE utf8_polish_ci NOT NULL,
  `label_EN` varchar(256) COLLATE utf8_polish_ci NOT NULL,
  `text_EN` text COLLATE utf8_polish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

--
-- Zrzut danych tabeli `pages_modules`
--

INSERT INTO `pages_modules` (`id`, `url`, `label_PL`, `active`, `level`, `parent`, `text_PL`, `uid`, `sublabel`, `type`, `description`, `params`, `label_EN`, `text_EN`) VALUES
(1, '', '', 1, 0, 1, '', '', '', 1, '', '', '', ''),
(2, '', '', 1, 0, 2, '', '', '', 2, '404', '', '', ''),
(3, '', '', 1, 0, 3, '', '', '', 3, '', '', '', ''),
(4, '', '', 1, 0, 4, '', '', '', 4, '', '', '', ''),
(5, '', '', 1, 1, 4, '<p>Thank you!</p>\r\n', '', '', 5, '', '', '', ''),
(6, '', 'Dziękujemy!', 1, 0, 5, '<p>Przejdź do <a href=\"/pl/login\">logowania</a></p>\r\n', '', '', 5, '', '', 'Thank you!', '<p>You can <a href=\"/en/login\">login</a> now!</p>\r\n'),
(7, '', 'Wylogowanie', 1, 0, 6, '<p>Zostałeś wylogowany.</p>\r\n', '', '', 5, '', '', 'Logout', '<p>You are looged out now!</p>\r\n'),
(8, '', '', 1, 0, 7, '', '', '', 6, '', '', '', ''),
(9, '', '', 1, 0, 8, '', '', '', 7, '', '', '', ''),
(10, '', '', 1, 0, 9, '', '', '', 8, '', '', '', '');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `s_pages_modules`
--

CREATE TABLE `s_pages_modules` (
  `id` int(11) NOT NULL,
  `slug` varchar(64) NOT NULL,
  `label` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Zrzut danych tabeli `s_pages_modules`
--

INSERT INTO `s_pages_modules` (`id`, `slug`, `label`) VALUES
(1, 'home', 'Home'),
(2, '404', '404'),
(3, 'login', 'Login'),
(4, 'register', 'Register'),
(5, 'text', 'Text'),
(6, 'profile', 'Profile'),
(7, 'password_reset', 'Password reset'),
(8, 'password_reset_set', 'Password reset - set new');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `s_translate`
--

CREATE TABLE `s_translate` (
  `id` int(11) NOT NULL,
  `slug` varchar(64) NOT NULL,
  `label_PL` varchar(512) NOT NULL,
  `label_EN` varchar(512) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Zrzut danych tabeli `s_translate`
--

INSERT INTO `s_translate` (`id`, `slug`, `label_PL`, `label_EN`) VALUES
(1, 'client_email_sent', 'Sprawdź skrzynkę pocztową i kliknij przesłany link aktywacyjny.', 'Check your e-mail and click activation link.'),
(2, 'client_system_error', 'Wystąpił błąd systemowy. Prosimy spróbować później.', 'System error. Please, try again later.'),
(3, 'client_required_fields_missing', 'Brak wszystkich wymaganych pół', 'Required fields are missing'),
(4, 'client_login_failed', 'Niepoprawne dane logowanie', 'Invalid login data'),
(5, 'client_login_success', 'Poprawne logowanie', 'Login success'),
(6, 'client_profile_success', 'Profil uaktualniono', 'Your profile has been updated'),
(7, 'client_password_changed', 'Hasło zostało zmienione', 'Your password has been changed'),
(8, 'client_old_password_wrong', 'Niepoprawne aktualne hasło', 'Current password is wrong'),
(9, 'client_password_invalid_format', 'Hasło nie spełnia standardów bezpieczeństwa', 'Password is too weak'),
(10, 'client_password_reset_sent', 'Sprawdź swój e-mail i postępuj zgodnie z zawartymi w nim sugestiami.', 'Please, check your e-mail and follow the instructions.');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users_logs`
--

CREATE TABLE `users_logs` (
  `id` int(11) NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user` int(11) NOT NULL,
  `action` enum('mailing_gdpr_expiry_alert','mailing_gdpr_expiry_information','mailing_gdpr_remove_information') DEFAULT NULL,
  `value` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `client_mailing`
--
ALTER TABLE `client_mailing`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `client_users`
--
ALTER TABLE `client_users`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `cms_settings`
--
ALTER TABLE `cms_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `cms_users`
--
ALTER TABLE `cms_users`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `cms_users_logs`
--
ALTER TABLE `cms_users_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `cms_users_logs_logins`
--
ALTER TABLE `cms_users_logs_logins`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indeksy dla tabeli `pages_modules`
--
ALTER TABLE `pages_modules`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `s_pages_modules`
--
ALTER TABLE `s_pages_modules`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `s_translate`
--
ALTER TABLE `s_translate`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `users_logs`
--
ALTER TABLE `users_logs`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT dla zrzuconych tabel
--

--
-- AUTO_INCREMENT dla tabeli `client_mailing`
--
ALTER TABLE `client_mailing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT dla tabeli `client_users`
--
ALTER TABLE `client_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT dla tabeli `cms_settings`
--
ALTER TABLE `cms_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `cms_users`
--
ALTER TABLE `cms_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT dla tabeli `cms_users_logs`
--
ALTER TABLE `cms_users_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT dla tabeli `cms_users_logs_logins`
--
ALTER TABLE `cms_users_logs_logins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT dla tabeli `media`
--
ALTER TABLE `media`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `menu`
--
ALTER TABLE `menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT dla tabeli `pages`
--
ALTER TABLE `pages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT dla tabeli `pages_modules`
--
ALTER TABLE `pages_modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT dla tabeli `s_pages_modules`
--
ALTER TABLE `s_pages_modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT dla tabeli `s_translate`
--
ALTER TABLE `s_translate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT dla tabeli `users_logs`
--
ALTER TABLE `users_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
