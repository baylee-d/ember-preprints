import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { task } from 'ember-concurrency';
import CasAuthenticatedRouteMixin from 'ember-osf/mixins/cas-authenticated-route';
import ConfirmationMixin from 'ember-onbeforeunload/mixins/confirmation';
import permissions from 'ember-osf/const/permissions';
import config from 'ember-get-config';

/**
 * @module ember-preprints
 * @submodule routes
 */

/**
 * Creates a preprint-request record
 * @class Withdraw Route Handler
 */
export default Route.extend(ConfirmationMixin, CasAuthenticatedRouteMixin, { // eslint-disable-line max-len
    store: service(),
    i18n: service(),
    theme: service(),
    currentUser: service(),
    preprint: null,

    afterModel(preprint) {
        this.set('preprint', preprint);
        if (preprint.get('dateWithdrawn')) {
            // if this preprint is withdrawn, then redirect to 'forbidden' page
            this.replaceWith('forbidden');
        }
        return preprint.get('provider')
            .then(this._getProviderInfo.bind(this))
            .then(this._getContributors.bind(this))
            .then(this.get('fetchWithdrawalRequest').perform());
    },
    renderTemplate() {
        this.render('content.withdraw');
    },
    fetchWithdrawalRequest: task(function* () {
        let withdrawalRequest = yield this.get('store').query(
            'preprint-request',
            { providerId: this.get('theme.id'), filter: { target: this.get('preprint.id'), machine_state: 'pending' } },
        );
        withdrawalRequest = withdrawalRequest.toArray();
        if (withdrawalRequest.length >= 1) {
            // If there is a pending withdrawal request, then redirect to 'forbidden' page
            this.replaceWith('forbidden');
        }
    }),
    _getProviderInfo(provider) {
        const preprint = this.get('preprint');
        const providerId = provider.get('id');
        const themeId = this.get('theme.id');
        const isOSF = providerId === 'osf';

        // If we're on the proper branded site, stay here.
        if (themeId === providerId) { return preprint.get('node'); }

        window.location.replace(`${config.OSF.url}${isOSF ? '' : `preprints/${providerId}/`}${preprint.get('id')}/withdraw/`);
        return Promise.reject();
    },

    _getContributors(node) {
        this.set('node', node);
        const userPermissions = this.get('node.currentUserPermissions') || [];
        if (!userPermissions.includes(permissions.ADMIN)) {
            this.replaceWith('forbidden'); // Non-admin trying to access withdraw form.
        }
    },
});
