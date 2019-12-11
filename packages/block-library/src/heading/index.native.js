/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { settings as webSettings } from './index.js';

export { metadata, name } from './index.js';

export const settings = {
	...webSettings,
	__experimentalLabel( attributes ) {
		const { content, level } = attributes;

		return isEmpty( content ) ?
			sprintf(
				/* translators: accessibility text. %s: heading level. */
				__( 'Level %s. Empty.' ),
				level
			) :
			sprintf(
				/* translators: accessibility text. 1: heading level. 2: heading content. */
				__( 'Level %1$s. %2$s' ),
				level,
				content
			);
	},
};
