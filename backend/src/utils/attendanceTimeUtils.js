export const DEFAULT_CHECK_IN_TIME = '09:30';
export const DEFAULT_BREAK_START_TIME = '13:00';
export const DEFAULT_BREAK_END_TIME = '14:00';

const timeToMinutes = (time, fallback) => {
  const [hours = 0, minutes = 0] = String(time || fallback)
    .split(':')
    .map((value) => Number(value || 0));
  return hours * 60 + minutes;
};

export const getTimeOnDay = (dayStart, time, fallback) =>
  new Date(dayStart.getTime() + timeToMinutes(time, fallback) * 60 * 1000);

export const getScheduledBreakDuration = ({
  dayStart,
  startTime = DEFAULT_BREAK_START_TIME,
  endTime = DEFAULT_BREAK_END_TIME,
  intervalStart,
  intervalEnd,
}) => {
  if (!intervalStart || !intervalEnd || intervalEnd <= intervalStart) return 0;

  const breakStart = getTimeOnDay(dayStart, startTime, DEFAULT_BREAK_START_TIME);
  const breakEnd = getTimeOnDay(dayStart, endTime, DEFAULT_BREAK_END_TIME);
  return Math.max(0, Math.min(intervalEnd, breakEnd) - Math.max(intervalStart, breakStart));
};

export const calculateWorkingMinutes = ({
  dayStart,
  checkInTime,
  checkOutTime,
  totalRecessDuration = 0,
  breakStartTime,
  breakEndTime,
}) => {
  if (!checkInTime || !checkOutTime) return 0;

  const elapsedMs = Math.max(0, new Date(checkOutTime) - new Date(checkInTime));
  const recessMs = Number(totalRecessDuration) > 0
    ? Number(totalRecessDuration)
    : getScheduledBreakDuration({
        dayStart,
        startTime: breakStartTime,
        endTime: breakEndTime,
        intervalStart: new Date(checkInTime),
        intervalEnd: new Date(checkOutTime),
      });

  return Math.max(0, Math.floor((elapsedMs - recessMs) / 60000));
};

export const getFullDayCheckoutTime = ({
  dayStart,
  checkInTime,
  totalWorkingMinutes,
  breakStartTime,
  breakEndTime,
}) => {
  const workEnd = new Date(new Date(checkInTime).getTime() + totalWorkingMinutes * 60 * 1000);
  const breakDuration = getScheduledBreakDuration({
    dayStart,
    startTime: breakStartTime,
    endTime: breakEndTime,
    intervalStart: new Date(checkInTime),
    intervalEnd: new Date(workEnd.getTime() + 60 * 60 * 1000),
  });
  return new Date(workEnd.getTime() + breakDuration);
};
