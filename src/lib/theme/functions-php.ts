export function buildFunctionsPhp(slug: string, themeName: string): string {
  const funcPrefix = slug.replace(/-/g, '_');

  return `<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function ${funcPrefix}_setup() {
    add_theme_support( 'wp-block-styles' );
    add_theme_support( 'editor-styles' );
}
add_action( 'after_setup_theme', '${funcPrefix}_setup' );

function ${funcPrefix}_enqueue_styles() {
    wp_enqueue_style( '${slug}-style', get_stylesheet_uri(), array(), wp_get_theme()->get( 'Version' ) );
}
add_action( 'wp_enqueue_scripts', '${funcPrefix}_enqueue_styles' );

function ${funcPrefix}_register_block_patterns() {
    register_block_pattern_category( '${slug}', array( 'label' => '${themeName}' ) );
}
add_action( 'init', '${funcPrefix}_register_block_patterns' );
`;
}
