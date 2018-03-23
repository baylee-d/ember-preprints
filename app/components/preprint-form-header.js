import { computed } from '@ember/object';
import config from 'ember-get-config';
import CpPanelToggleComponent from 'ember-collapsible-panel/components/cp-panel-toggle/component';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Extends Ember Collapsible Panel's CpPanelToggleComponent.  Customizes the collapsible panel header.
 *
 * Sample usage:
 * ```handlebars
 * {{preprint-form-header}}
 *    name=(if nodeLocked 'preprint_file' 'choose_file')
 *    selectedFile=osfFile
 *    fileVersion=fileVersion
 *    file=file
 *    showValidationIndicator=false
 * }}
 * ```
 * @class preprint-form-header
 * */
export default CpPanelToggleComponent.extend({
    tagName: 'header',
    // Variables to pass in
    enabled: true,
    showValidationIndicator: true,
    isOpen: false,
    valid: null,
    isValidationActive: false,
    providerAssetsURL: config.providerAssetsURL,

    // Calculated properties
    invalid: computed('valid', 'isValidationActive', function() {
        // If the user hasn't even opened the panel yet, don't run the validation check
        // In other words, not true or null
        if (this.get('isValidationActive')) {
            return !this.get('valid');
        } else {
            return false;
        }
    }),
    // CSS controls icon color and display. If neither valid nor invalid state applies, don't show icon.
    classNameBindings: ['enabled::disabled', 'valid:valid', 'invalid:invalid', 'isValidationActive::not-validated'],
});
