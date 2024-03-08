/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
  
  config.width='100%';
  var height=$('.ckeditor').data('height');
  if (height) config.height=height; else   config.height=300;
  config.extraAllowedContent = 'img[src,alt,width,height];div(blockquote-right)';
  config.disableNativeSpellChecker = true;

  config.toolbar = [
	{ name: 'clipboard', groups: [ 'clipboard', 'undo' ], items: [  'PasteText', 'PasteFromWord' ] },
	{ name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
	{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat' ] },

	{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align' ], items: [ 'NumberedList', 'BulletedList', 'Blockquote' ] },
	'/',
	{ name: 'styles', items: [ 'Format','Styles','uho_media', 'uho_audio' ] },
	{ name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source' ] }
  
  
];




// Load from a list of definitions.

	config.stylesSet =
	[
        { name: 'Inline Quote',   element:'q',   attributes: { 'class': 'quote' } },
    	
    ];
  


/*
config.toolbarGroups = [
		{ name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
		{ name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
		{ name: 'links' },
		{ name: 'insert' },
		{ name: 'forms' },
		{ name: 'tools' },
		{ name: 'document',	   groups: [ 'mode', 'document', 'doctools' ] },
		{ name: 'others' },
		'/',
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
		{ name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
		{ name: 'styles' },
		{ name: 'colors' },
		{ name: 'about' }
	];
/*
config.toolbar = [
	{ name: 'clipboard', groups: [ 'clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord' ] },
	{ name: 'editing', groups: [ 'find', 'selection', 'spellchecker' ], items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ] },
	{ name: 'links', items: [ 'Link', 'Unlink', 'Anchor', 'SpecialChar' ] },
	{ name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates' ] },
	'/',
	{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat' ] },
	{ name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
	{ name: 'colors', items: [ 'TextColor', 'BGColor' ] },
	{ name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },
	{ name: 'others', items: [ '-' ] }
  
  
];
  */


config.allowedContent = {
  $1: {
        elements: CKEDITOR.dtd,
        attributes: true,
        styles: true,
        classes: true
      }
  };

  	config.disallowedContent = '*[style]{*};span';

	// Remove some buttons, provided by the standard plugins, which we don't
	// need to have in the Standard(s) toolbar.
	config.removeButtons = 'RemoveFormat,Anchor,Underline,Subscript,Superscript,PasteFromWord,Strike,Maximize';

	// Se the most common block elements.
	config.format_tags = 'p;h1;h2;h3';

	// Make dialogs simpler.
	config.removeDialogTabs = 'image:advanced;link:advanced';
    //config.extraPlugins = 'timestamp';
    config.extraPlugins = 'onchange,uho_customkeyboardshortcuts,uho_media,uho_audio';
    //config.embed_provider='//ckeditor.iframe.ly/api/oembed?url={url}&callback={callback}';

};
