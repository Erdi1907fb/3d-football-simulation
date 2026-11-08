<?php
// Copy to config.php. Never add keys or tokens here if they would be in public URLs.
return [
    // Optional: provider-setup.php saves the key privately without changing config.php.
    'bsd_api_key' => getenv('BSD_API_KEY') ?: '',
    'refresh_seconds' => 21600,
    'auto_refresh_on_visit' => true,
    'uel_enabled' => true,
    'uecl_enabled' => true,
    'unl_enabled' => true,
    'intl_enabled' => true,
    'fixture_scope' => 'all',
    // No per-day cap while fixture_scope is all.
    'max_daily_matches' => 0,
    // Prefer an absolute folder OUTSIDE public_html if your hosting allows it:
    // 'storage_dir' => '/home/USERNAME/domains/DOMAIN/pulse-pitch-private',
    // Only authorize hosts which you own or have permission to use.
    // 'source_hosts' => ['raw.githubusercontent.com', 'api.openligadb.de', 'data.example.org'],
    // 'normalized_feed_url' => 'https://data.example.org/football.json',
    // 'normalized_feed_label' => 'Licensed football feed',
];
