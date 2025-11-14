<?php
/*
Plugin Name: BookingX
Description: Provides the [bookingx] shortcode that renders a static booking UI with inline calendar.
Version: 1.0.0
Author: Your Team
*/

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

function bookingx_enqueue_assets() {
    // BookingX base styles
    wp_register_style(
        'bookingx-style',
        plugins_url('assets/bookingx.css', __FILE__),
        [],
        '1.0.1'
    );

    // Flatpickr library (free MIT)
    wp_register_style(
        'flatpickr-css',
        'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css',
        [],
        null
    );
    wp_register_script(
        'flatpickr-js',
        'https://cdn.jsdelivr.net/npm/flatpickr',
        [],
        null,
        true
    );

    // BookingX init script
    wp_register_script(
        'bookingx-init',
        plugins_url('assets/bookingx-init.js', __FILE__),
        ['flatpickr-js'],
        '1.0.1',
        true
    );
}
add_action('init', 'bookingx_enqueue_assets');

function bookingx_shortcode_render() {
    wp_enqueue_style('bookingx-style');

    ob_start();
    ?>
    <div class="bookingx-container" role="group" aria-label="BookingX">
        <div class="bx-card">
            <div class="bx-header">
                <div class="bx-step">1 of 3</div>
                <h3 class="bx-title">Charter details</h3>
            </div>

            <div class="bx-section">
                <div class="bx-row">
                    <div class="bx-section-title">1. Date</div>
                    <button id="bx-date-toggle" class="bx-date-toggle" aria-expanded="true" type="button">Nov, 18</button>
                </div>
                <div id="bx-calendar"></div>
            </div>

            <div id="bx-post-date" class="bx-post-date bx-hidden">
                <div class="bx-divider"></div>
                <div class="bx-section">
                    <div class="bx-row">
                        <div class="bx-section-title">Duration / Pick-up time</div>
                        <button class="bx-select-btn" type="button">Select</button>
                    </div>
                </div>

                <div class="bx-divider"></div>

                <div class="bx-section">
                    <div class="bx-section-title">3. Guests</div>
                    <div class="bx-guest-slider">
                        <input id="bx-guests-range" type="range" min="1" max="12" value="6" />
                        <div id="bx-guests-bubble" class="bx-bubble">6</div>
                    </div>
                </div>
            </div>

            <div class="bx-footer">
                <div class="bx-price">
                    <span class="bx-amount">$6,527</span>
                    <div class="bx-duration">
                        <span>per 8 hrs</span>
                        <span class="bx-caret">▾</span>
                    </div>
                </div>
                <button class="bx-continue" disabled>CONTINUE</button>
            </div>
        </div>
    </div>
    <?php
    $html = ob_get_clean();

    // Enqueue Flatpickr assets and init script
    wp_enqueue_style('flatpickr-css');
    wp_enqueue_script('flatpickr-js');
    wp_enqueue_script('bookingx-init');
    return $html;
}
add_shortcode('bookingx', 'bookingx_shortcode_render');