import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

const PRE_MODERATION = 'pre-moderation';
const POST_MODERATION = 'post-moderation';
const NO_MODERATION = 'no-moderation';

const NOTICE_MESSAGE = {
    [PRE_MODERATION]: 'withdraw.pre_moderation_notice',
    [POST_MODERATION]: 'withdraw.post_moderation_notice',
    [NO_MODERATION]: 'withdraw.no_moderation_notice',
};

export default Controller.extend({
    theme: service(),
    store: service(),
    currentUser: service(),
    toast: service(),
    i18n: service(),
    explanation: '',

    notice: computed('model.provider.{reviewsWorkflow,documentType}', function () {
        const reviewsWorkflow = this.get('model.provider.reviewsWorkflow');
        if (reviewsWorkflow) {
            return this.get('i18n').t(NOTICE_MESSAGE[reviewsWorkflow], { documentType: this.get('model.provider.documentType') });
        } else {
            return this.get('i18n').t(NOTICE_MESSAGE[NO_MODERATION], { documentType: this.get('model.provider.documentType') });
        }
    }),

    withdrawButtonLabel: computed('model.isPublished', function () {
        return this.get('model.isPublished') ? 'withdraw.withdraw_button_published' : 'withdraw.withdraw_button_not_published';
    }),

    submitWithdrawalRequest: task(function* () {
        const request = this.store.createRecord('preprint-request', {
            comment: this.get('explanation'),
            requestType: 'withdrawal',
            target: this.get('model'),
        });
        try {
            yield request.save();
            // Go to the detail page once the withdrawal request is successfully submitted.
            this.transitionToRoute(`${this.get('theme.isSubRoute') ? 'provider.' : ''}content`, this.get('model'));
        } catch (e) {
            this.get('toast').error(e.errors[0].detail);
        }
    }),

    actions: {
        cancel() {
            this.transitionToRoute(
                `${this.get('theme.isSubRoute') ? 'provider.' : ''}content`,
                this.get('model'),
            );
        },
    },
});
