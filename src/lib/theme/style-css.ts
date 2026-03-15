export function buildStyleCss(
  themeName: string,
  slug: string,
  description: string,
  additionalCss: string
): string {
  const truncatedDesc =
    description.length > 200 ? description.slice(0, 197) + '...' : description;

  let css = `/*
Theme Name: ${themeName}
Theme URI:
Author: AI Theme Generator
Author URI:
Description: ${truncatedDesc}
Version: 1.0.0
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: ${slug}
Requires at least: 6.4
Tested up to: 6.7
Requires PHP: 7.4
*/
`;

  if (additionalCss.trim()) {
    css += '\n' + additionalCss.trim() + '\n';
  }

  return css;
}
