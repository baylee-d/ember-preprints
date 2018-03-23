import { moduleFor, test } from 'ember-qunit';

moduleFor('route:resource-deleted', 'Unit | Route | resource deleted', {
    // Specify the other units that are required for this test.
    needs: ['service:metrics', 'service:theme'],
});

test('it exists', function(assert) {
    const route = this.subject();
    assert.ok(route);
});
