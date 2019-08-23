/**
 * External dependencies
 */
import { get, omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import {
	Spinner,
	CheckboxControl,
	withFocusReturn,
	withConstrainedTabbing,
	Modal,
	Button,
} from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import PostPublishButton from '../post-publish-button';
import PostPublishModalPrepublish from './prepublish';
import PostPublishModalPostpublish from './postpublish';

export class PostPublishModal extends Component {
	constructor() {
		super( ...arguments );
		this.onSubmit = this.onSubmit.bind( this );
	}

	componentDidUpdate( prevProps ) {
		// Automatically collapse the publish sidebar when a post
		// is published and the user makes an edit.
		if ( prevProps.isPublished && ! this.props.isSaving && this.props.isDirty ) {
			this.props.onClose();
		}
	}

	onSubmit() {
		const { onClose, hasPublishAction, isPostTypeViewable } = this.props;
		if ( ! hasPublishAction || ! isPostTypeViewable ) {
			onClose();
		}
	}

	render() {
		const {
			forceIsDirty,
			forceIsSaving,
			isBeingScheduled,
			isPublished,
			isPublishSidebarEnabled,
			isScheduled,
			isSaving,
			onClose,
			onTogglePublishSidebar,
			PostPublishExtension,
			PrePublishExtension,
			hasPublishAction,
			...additionalProps
		} = this.props;
		const propsForModal = omit( additionalProps, [ 'hasPublishAction', 'isDirty', 'isPostTypeViewable' ] );
		const isPublishedOrScheduled = isPublished || ( isScheduled && isBeingScheduled );
		const isPrePublish = ! isPublishedOrScheduled || isSaving;
		const isPostPublish = isPublishedOrScheduled && ! isSaving;

		let modalTitle;
		if ( isSaving ) {
			modalTitle = isScheduled ? __( 'Scheduling' ) : __( 'Publishing' );
		} else if ( isPrePublish ) {
			if ( ! hasPublishAction ) {
				modalTitle = __( 'Ready to submit for review?' );
			} else if ( isBeingScheduled ) {
				modalTitle = __( 'Ready to schedule?' );
			} else {
				modalTitle = __( 'Ready to publish?' );
			}
		} else {
			modalTitle = isScheduled ? __( 'Post Scheduled' ) : __( 'Post Published!' ); //TODO: update Post with Post/Page/Custom type
		}
		return (
			<Modal
				className="editor-post-publish-modal"
				title={ modalTitle }
				closeLabel={ __( 'Close' ) }
				onRequestClose={ onClose }
			>
				<div className="editor-post-publish-modal__content" { ...propsForModal }>
					{ isPrePublish && (
						isSaving ?
							<Spinner /> :
							<>
								<PostPublishModalPrepublish>
									{ PrePublishExtension && <PrePublishExtension /> }
								</PostPublishModalPrepublish>
								<CheckboxControl
									label={ __( 'Always show these pre-publish checks.' ) }
									checked={ isPublishSidebarEnabled }
									onChange={ onTogglePublishSidebar }
								/>
							</>
					) }

					{ isPostPublish && (
						<PostPublishModalPostpublish focusOnMount={ true } >
							{ PostPublishExtension && <PostPublishExtension /> }
						</PostPublishModalPostpublish>
					) }

					{ ! isPostPublish && (
						<div className="editor-post-publish-modal__content-publish-controls">
							<Button isLink isLarge className="editor-post-publish-modal__content-cancel-button">
								{ __( 'Cancel' ) }
							</Button>
							<PostPublishButton className="editor-post-publish-modal__content-cancel-button" focusOnMount={ true } onSubmit={ this.onSubmit } forceIsDirty={ forceIsDirty } forceIsSaving={ forceIsSaving } />
							<span className="editor-post-publish-modal__spacer"></span>
						</div>
					) }
				</div>
			</Modal>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		const { getPostType } = select( 'core' );
		const {
			getCurrentPost,
			getEditedPostAttribute,
			isCurrentPostPublished,
			isCurrentPostScheduled,
			isEditedPostBeingScheduled,
			isEditedPostDirty,
			isSavingPost,
		} = select( 'core/editor' );
		const { isPublishSidebarEnabled } = select( 'core/editor' );
		const postType = getPostType( getEditedPostAttribute( 'type' ) );

		return {
			hasPublishAction: get( getCurrentPost(), [ '_links', 'wp:action-publish' ], false ),
			isPostTypeViewable: get( postType, [ 'viewable' ], false ),
			isBeingScheduled: isEditedPostBeingScheduled(),
			isDirty: isEditedPostDirty(),
			isPublished: isCurrentPostPublished(),
			isPublishSidebarEnabled: isPublishSidebarEnabled(),
			isSaving: isSavingPost(),
			isScheduled: isCurrentPostScheduled(),
		};
	} ),
	withDispatch( ( dispatch, { isPublishSidebarEnabled } ) => {
		const { disablePublishSidebar, enablePublishSidebar } = dispatch( 'core/editor' );

		return {
			onTogglePublishSidebar: ( ) => {
				if ( isPublishSidebarEnabled ) {
					disablePublishSidebar();
				} else {
					enablePublishSidebar();
				}
			},
		};
	} ),
	withFocusReturn,
	withConstrainedTabbing,
] )( PostPublishModal );