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

// Check if WooCommerce is active; if not, deactivate this plugin.
add_action('admin_init', 'bookingx_check_woocommerce');
function bookingx_check_woocommerce()
{
    if (!class_exists('WooCommerce')) {
        deactivate_plugins(plugin_basename(__FILE__));
        add_action('admin_notices', function () {
            echo '<div class="notice notice-error"><p>BookingX requires WooCommerce to be active. Plugin has been deactivated.</p></div>';
        });
    }
}


function bookingx_enqueue_assets()
{
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

// Only enqueue assets on WooCommerce product single pages
function bookingx_enqueue_on_product_pages()
{
    if (is_admin()) return;
    $is_product_page = function_exists('is_product') ? is_product() : is_singular('product');
    if ($is_product_page) {
        wp_enqueue_style('bookingx-style');
        wp_enqueue_style('flatpickr-css');
        // bookingx-init depends on flatpickr-js, WordPress will load it automatically
        wp_enqueue_script('bookingx-init');
    }
}
add_action('wp_enqueue_scripts', 'bookingx_enqueue_on_product_pages');

function bookingx_shortcode_render()
{
    wp_enqueue_style('bookingx-style');

    ob_start();

    $product_id = get_the_ID();
    $product    = wc_get_product($product_id);
    $default_label = '';
    $default_price = 0;
    $currency_symbol = function_exists('get_woocommerce_currency_symbol') ? get_woocommerce_currency_symbol() : '$';
?>
    <div class="bookingx-container" role="group" aria-label="BookingX" data-currency-symbol="<?php echo esc_attr($currency_symbol); ?>">
        <div class="bx-card">
            <div class="bx-header">
                <!-- <div class="bx-step">1 of 3</div> -->
                <!-- <h3 class="bx-title">Charter details</h3> -->
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
                        <button id="bx-select-btn" class="bx-select-btn" type="button">Select</button>
                    </div>
                    <div class="bx-duration-section bx-hidden">
                        <div class="bx-section-title">Duration</div>
                        <?php
                        // Render duration buttons dynamically from variable product variations
                        $rendered_buttons = false;
                        if ($product && $product->is_type('variable')) {
                            $variation_ids = $product->get_children();
                            if (!empty($variation_ids)) {
                                echo '<div class="bx-duration-group" role="tablist">';
                                $first = true;
                                foreach ($variation_ids as $vid) {
                                    $variation = wc_get_product($vid);
                                    if (!$variation) continue;
                                    $attrs  = $variation->get_attributes();
                                    $label  = '';
                                    $token  = 'multi';

                                    // Prefer the first attribute value as the button label (e.g. 4hr, 6hr, multi-day, over-night)
                                    if (!empty($attrs)) {
                                        $firstVal = reset($attrs);
                                        $label = is_array($firstVal) ? implode(' ', $firstVal) : (string) $firstVal;
                                    }
                                    // Fallbacks if attribute value is empty
                                    if ($label === '') {
                                        $attrs_summary = function_exists('wc_get_product_variation_attributes') ? wc_get_product_variation_attributes($vid) : array();
                                        if (!empty($attrs_summary)) {
                                            $label = implode(' ', array_values($attrs_summary));
                                        }
                                        if ($label === '') {
                                            $label = $variation->get_name();
                                        }
                                    }

                                    // Derive a token used by JS for behavior: numeric hours or 'multi' for multi-day/overnight
                                    $lv = strtolower(trim($label));
                                    if (preg_match('/(\d+)/', $lv, $m)) {
                                        $token = $m[1];
                                    } elseif (strpos($lv, 'multi') !== false || strpos($lv, 'day') !== false || strpos($lv, 'overnight') !== false || strpos($lv, 'over-night') !== false) {
                                        $token = 'multi';
                                    } else {
                                        // Generic fallback token based on label slug
                                        $token = sanitize_title($lv);
                                    }

                                    $display_price = wc_get_price_to_display($variation);

                                    // Capture defaults from the first variation
                                    if ($first) {
                                        $default_label = $label;
                                        $default_price = $display_price;
                                    }

                                    printf(
                                        '<button type="button" class="bx-duration-btn%s" data-duration="%s" data-variation-id="%d" data-variation-price="%s">%s</button>',
                                        $first ? ' active' : '',
                                        esc_attr($token),
                                        absint($vid),
                                        esc_attr($display_price),
                                        esc_html($label)
                                    );
                                    $first = false;
                                }
                                echo '</div>';
                                $rendered_buttons = true;
                            }
                        }
                        ?>
                    </div>

                    <div class="bx-row bx-hidden" style="margin-top:12px;">
                        <div class="bx-section-title">Dates</div>
                        <div class="bx-row-right">
                            <div id="bx-date-range" class="bx-date-range">Nov 17, 2025 to Nov 18, 2025</div>
                            <div class="bx-days-pill">
                                <button id="bx-days-minus" type="button" aria-label="Decrease days">−</button>
                                <button id="bx-days-plus" type="button" aria-label="Increase days">+</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="bx-time-section" class="bx-section bx-hidden">
                    <div class="bx-section-title">Available Pick-up Times</div>
                    <div id="bx-time-grid" class="bx-time-grid"></div>
                </div>

                <div class="bx-divider"></div>

                <div class="bx-section">
                    <div class="bx-section-title">3. Guests</div>
                    <div class="bx-guest-slider">
                        <div id="bx-guest-track" class="bx-track" data-min="1" data-max="12">
                            <div id="bx-guests-bubble" class="bx-bubble" role="slider" aria-valuemin="1" aria-valuemax="12" aria-valuenow="6" tabindex="0">6</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bx-footer">
                <div class="bx-price">
                    <span class="bx-amount"><?php echo function_exists('wc_price') ? wc_price($default_price) : esc_html($currency_symbol . number_format((float)$default_price, 2)); ?></span>
                    <div class="bx-duration">
                        <span><?php echo $default_label ? ('per ' . esc_html($default_label)) : ''; ?></span>
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
add_action('wp_footer', 'bookingx_footer_script');
function bookingx_footer_script()
{
    // Check if this is a WooCommerce product details page
    if (function_exists('is_product') && is_product()) {
        ?>
        <div id="bookingxModal" class="bookingx-modal">
            <div class="bookingx-modal-content">
                <span class="bookingx-close" onclick="closeModal()">&times;</span>
                <div class="bookingx-modal-header">
               <!-- <h2 class="bookingx-modal-title">Modal Title</h2> -->
                </div>
                <div class="bookingx-modal-body">
                    <?php echo do_shortcode('[bookingx]'); ?>
                </div>
            </div>
        </div>
        <?php

    }
}
