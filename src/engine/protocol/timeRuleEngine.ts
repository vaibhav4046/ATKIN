/**
 * ATKIN Sovereign Legal OS — CPR 2.8 Time Rule Engine
 * 
 * Implements Civil Procedure Rules Rule 2.8 (Time) calculation engine
 * for England and Wales jurisdiction with official Court closure and Bank Holiday rules.
 * 
 * Rules reference: CPR 2.8 / Practice Direction 2A
 * Calendar reference: GOV.UK Bank Holidays in England and Wales (2026-2027)
 */

export interface TimeRuleInput {
  ruleSet: 'CPR_2_8';
  startDate: string; // ISO date 'YYYY-MM-DD'
  numberOfDays: number;
  direction: 'after' | 'before';
  endDefinedByEvent: boolean;
  actAtCourtOffice: boolean;
  jurisdiction: 'England and Wales';
  timezone: 'Europe/London';
}

export interface ExcludedDate {
  date: string;
  reason: 'weekend_saturday' | 'weekend_sunday' | 'bank_holiday' | 'christmas_day' | 'good_friday';
}

export interface DeadlineResult {
  resultDate: string;
  startDate: string;
  numberOfDays: number;
  direction: 'after' | 'before';
  endDefinedByEvent: boolean;
  actAtCourtOffice: boolean;
  includedDates: string[];
  excludedDates: ExcludedDate[];
  courtClosureRolloverApplied: boolean;
  ruleReferences: string[];
  holidayCalendarVersion: string;
  ruleVerifiedAt: string;
  disclaimer: string;
}

// Official statutory bank holidays for England & Wales
export const ENGLAND_WALES_BANK_HOLIDAYS: Record<string, string> = {
  // 2026
  '2026-01-01': "New Year's Day",
  '2026-04-03': 'Good Friday',
  '2026-04-06': 'Easter Monday',
  '2026-05-04': 'Early May bank holiday',
  '2026-05-25': 'Spring bank holiday',
  '2026-08-31': 'Summer bank holiday',
  '2026-12-25': 'Christmas Day',
  '2026-12-28': 'Boxing Day (substitute day)',
  // 2027
  '2027-01-01': "New Year's Day",
  '2027-03-26': 'Good Friday',
  '2027-03-29': 'Easter Monday',
  '2027-05-03': 'Early May bank holiday',
  '2027-05-31': 'Spring bank holiday',
  '2027-08-30': 'Summer bank holiday',
  '2027-12-27': 'Christmas Day (substitute day)',
  '2027-12-28': 'Boxing Day (substitute day)'
};

export class TimeRuleEngine {
  private static readonly CALENDAR_VERSION = 'GOV.UK-EW-2026-2027-v1';
  private static readonly DISCLAIMER = 'Calculated under encoded CPR 2.8 rules. Verify any rule-specific deadline provision and court order.';

  /**
   * Helper to format Date to YYYY-MM-DD in UTC
   */
  public static formatDate(d: Date): string {
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper to parse YYYY-MM-DD into a UTC Date
   */
  public static parseDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  }

  /**
   * Checks if date is a court-closed day (Saturday, Sunday, or Bank Holiday)
   */
  public static isCourtClosed(dateStr: string, dateObj: Date): { closed: boolean; reason?: ExcludedDate['reason'] } {
    const dayOfWeek = dateObj.getUTCDay(); // 0 = Sun, 6 = Sat
    if (dayOfWeek === 6) return { closed: true, reason: 'weekend_saturday' };
    if (dayOfWeek === 0) return { closed: true, reason: 'weekend_sunday' };

    const holiday = ENGLAND_WALES_BANK_HOLIDAYS[dateStr];
    if (holiday) {
      if (holiday === 'Christmas Day') return { closed: true, reason: 'christmas_day' };
      if (holiday === 'Good Friday') return { closed: true, reason: 'good_friday' };
      return { closed: true, reason: 'bank_holiday' };
    }

    return { closed: false };
  }

  /**
   * Calculates statutory deadline according to CPR 2.8
   */
  public static calculate(input: TimeRuleInput): DeadlineResult {
    if (input.jurisdiction !== 'England and Wales') {
      throw new Error(`TimeRuleEngine only supports England and Wales, got: ${input.jurisdiction}`);
    }
    if (input.ruleSet !== 'CPR_2_8') {
      throw new Error(`Unsupported ruleSet: ${input.ruleSet}`);
    }

    const isShortPeriod = input.numberOfDays <= 5;
    const isForward = input.direction === 'after';
    const stepDays = isForward ? 1 : -1;

    const startDateObj = this.parseDate(input.startDate);
    const currentDate = new Date(startDateObj.getTime());

    const includedDates: string[] = [];
    const excludedDates: ExcludedDate[] = [];

    // CPR 2.8(3)(a): The day on which the period begins is NOT included.
    // Advance 1 day before starting clear day counting.
    currentDate.setUTCDate(currentDate.getUTCDate() + stepDays);

    let daysCounted = 0;
    while (daysCounted < input.numberOfDays) {
      const dateStr = this.formatDate(currentDate);
      const closureCheck = this.isCourtClosed(dateStr, currentDate);

      // CPR 2.8(4): Where the specified period is 5 days or less,
      // Saturdays, Sundays, Bank Holidays, Christmas Day and Good Friday do NOT count.
      if (isShortPeriod && closureCheck.closed && closureCheck.reason) {
        excludedDates.push({
          date: dateStr,
          reason: closureCheck.reason
        });
      } else {
        // Ordinary calendar day counts
        includedDates.push(dateStr);
        daysCounted++;
      }

      // If we haven't reached the target clear days, advance to next day
      if (daysCounted < input.numberOfDays) {
        currentDate.setUTCDate(currentDate.getUTCDate() + stepDays);
      }
    }

    // Now currentDate holds the last clear day counted.
    // If end is defined by an event:
    // CPR 2.8(3)(b): The day on which that event occurs is NOT included in the clear days.
    // Therefore, the event must occur AFTER the clear days period.
    let finalDate = new Date(currentDate.getTime());
    if (input.endDefinedByEvent) {
      finalDate.setUTCDate(finalDate.getUTCDate() + stepDays);
    }

    let rolloverApplied = false;

    // CPR 2.8(5): If act must be done at a court office and expiry falls on a closed day,
    // act shall be in time if done on the next day the office is open.
    if (input.actAtCourtOffice) {
      let finalStr = this.formatDate(finalDate);
      let check = this.isCourtClosed(finalStr, finalDate);

      while (check.closed) {
        rolloverApplied = true;
        // In English civil procedure, rollover for court closure always moves forward to next open day
        finalDate.setUTCDate(finalDate.getUTCDate() + 1);
        finalStr = this.formatDate(finalDate);
        check = this.isCourtClosed(finalStr, finalDate);
      }
    }

    const ruleRefs = ['CPR 2.8(2)', 'CPR 2.8(3)'];
    if (isShortPeriod) ruleRefs.push('CPR 2.8(4)');
    if (input.actAtCourtOffice) ruleRefs.push('CPR 2.8(5)');

    return {
      resultDate: this.formatDate(finalDate),
      startDate: input.startDate,
      numberOfDays: input.numberOfDays,
      direction: input.direction,
      endDefinedByEvent: input.endDefinedByEvent,
      actAtCourtOffice: input.actAtCourtOffice,
      includedDates,
      excludedDates,
      courtClosureRolloverApplied: rolloverApplied,
      ruleReferences: ruleRefs,
      holidayCalendarVersion: this.CALENDAR_VERSION,
      ruleVerifiedAt: new Date().toISOString(),
      disclaimer: this.DISCLAIMER
    };
  }
}
