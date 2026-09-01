import test from 'node:test';
import assert from 'node:assert/strict';

import { isKeyFailure } from './generate-daily-question.js';

test('treats invalid OpenRouter API keys as retryable failures', () => {
    assert.equal(isKeyFailure(401, '{"error":{"message":"User not found."}}'), true);
    assert.equal(isKeyFailure(403, 'Forbidden'), true);
    assert.equal(isKeyFailure(402, 'Insufficient credits'), true);
    assert.equal(isKeyFailure(500, 'Internal server error'), false);
});
