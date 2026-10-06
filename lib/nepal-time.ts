import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/** The store operates in Nepal; day boundaries follow Nepal time, not the server's. */
export const STORE_TZ = 'Asia/Kathmandu';

/** dayjs in store time. With no argument, "now". */
export const storeTime = (value?: Date | string | number | null) =>
  (value == null ? dayjs() : dayjs(value)).tz(STORE_TZ);

/** A calendar date like "2026-10-04" interpreted as that day in store time. */
export const storeDate = (yyyyMmDd: string) => dayjs.tz(yyyyMmDd, STORE_TZ);
