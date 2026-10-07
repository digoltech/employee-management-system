import test from 'node:test';
import assert from 'node:assert/strict';
import { FULL_DAY_MINUTES, getWorkedDayStatus } from '../src/utils/attendanceTimeUtils.js';

test('450 worked minutes is a full day; 449 is a half day', () => {
  assert.equal(FULL_DAY_MINUTES, 450);
  assert.equal(getWorkedDayStatus(449), 'half-day');
  assert.equal(getWorkedDayStatus(450), 'full-day');
  assert.equal(getWorkedDayStatus(451), 'full-day');
});

test('the absent threshold remains separate', () => {
  assert.equal(getWorkedDayStatus(179), 'absent');
  assert.equal(getWorkedDayStatus(180), 'half-day');
  assert.equal(getWorkedDayStatus(200, 240), 'absent');
});
