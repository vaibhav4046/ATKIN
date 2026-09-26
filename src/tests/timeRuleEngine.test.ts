import { describe, it, expect } from 'vitest';
import { TimeRuleEngine, type TimeRuleInput } from '../engine/protocol/timeRuleEngine.ts';

describe('CPR 2.8 TimeRuleEngine (Civil Procedure Rules)', () => {
  it('Vector 1 (CPR Example A): at least 3 clear days before Friday 20 Oct -> Monday 16 Oct', () => {
    const input: TimeRuleInput = {
      ruleSet: 'CPR_2_8',
      startDate: '2023-10-20', // Friday 20 Oct (official CPR statutory example year where 20 Oct is Friday)
      numberOfDays: 3,
      direction: 'before',
      endDefinedByEvent: true, // Hearing is the event; event day excluded
      actAtCourtOffice: false,
      jurisdiction: 'England and Wales',
      timezone: 'Europe/London'
    };

    const res = TimeRuleEngine.calculate(input);
    expect(res.resultDate).toBe('2023-10-16'); // Monday 16 Oct
    expect(res.includedDates).toEqual(['2023-10-19', '2023-10-18', '2023-10-17']); // 3 clear days
    expect(res.ruleReferences).toContain('CPR 2.8(3)');
    expect(res.ruleReferences).toContain('CPR 2.8(4)');
    expect(res.disclaimer).toContain('Calculated under encoded CPR 2.8 rules');
  });

  it('Vector 2 (CPR Example B): hearing at least 28 days after notice on 1 Oct -> earliest 30 Oct', () => {
    const input: TimeRuleInput = {
      ruleSet: 'CPR_2_8',
      startDate: '2026-10-01', // Notice given 1 Oct
      numberOfDays: 28,
      direction: 'after',
      endDefinedByEvent: true, // Hearing is the event
      actAtCourtOffice: false,
      jurisdiction: 'England and Wales',
      timezone: 'Europe/London'
    };

    const res = TimeRuleEngine.calculate(input);
    expect(res.resultDate).toBe('2026-10-30'); // Earliest date for hearing is 30 Oct
    expect(res.includedDates.length).toBe(28);
    expect(res.includedDates[0]).toBe('2026-10-02');
    expect(res.includedDates[27]).toBe('2026-10-29');
    expect(res.ruleReferences).not.toContain('CPR 2.8(4)'); // >5 days, short-period rule does not apply
  });

  it('Vector 3 (CPR Example C): particulars within 14 days after claim form served 2 Oct -> 16 Oct', () => {
    const input: TimeRuleInput = {
      ruleSet: 'CPR_2_8',
      startDate: '2026-10-02', // Service date
      numberOfDays: 14,
      direction: 'after',
      endDefinedByEvent: false, // Act must be done within 14 days
      actAtCourtOffice: false,
      jurisdiction: 'England and Wales',
      timezone: 'Europe/London'
    };

    const res = TimeRuleEngine.calculate(input);
    expect(res.resultDate).toBe('2026-10-16'); // 16 Oct
    expect(res.includedDates.length).toBe(14);
    expect(res.includedDates[0]).toBe('2026-10-03');
    expect(res.includedDates[13]).toBe('2026-10-16');
  });

  it('Vector 4 (Short Christmas period): 5 days after Monday 21 Dec 2026 -> Wed 30 Dec 2026', () => {
    const input: TimeRuleInput = {
      ruleSet: 'CPR_2_8',
      startDate: '2026-12-21', // Monday
      numberOfDays: 5, // <= 5 days -> short period exclusions apply
      direction: 'after',
      endDefinedByEvent: false,
      actAtCourtOffice: false,
      jurisdiction: 'England and Wales',
      timezone: 'Europe/London'
    };

    const res = TimeRuleEngine.calculate(input);
    expect(res.resultDate).toBe('2026-12-30'); // Wednesday 30 Dec 2026

    // Excluded days: Christmas Day (Fri), Sat, Sun, Boxing Day substitute (Mon)
    const excludedReasons = res.excludedDates.map(e => `${e.date}:${e.reason}`);
    expect(excludedReasons).toContain('2026-12-25:christmas_day');
    expect(excludedReasons).toContain('2026-12-26:weekend_saturday');
    expect(excludedReasons).toContain('2026-12-27:weekend_sunday');
    expect(excludedReasons).toContain('2026-12-28:bank_holiday');

    expect(res.includedDates).toEqual([
      '2026-12-22',
      '2026-12-23',
      '2026-12-24',
      '2026-12-29',
      '2026-12-30'
    ]);
  });

  it('Vector 5 (Court-office closure rollover): rolls from closed holiday to next open court day', () => {
    // 6-day period starting Monday 18 May 2026
    // Intervening weekend counts because period > 5 days.
    // Day 6 lands on Sunday 24 May 2026 (closed).
    // Monday 25 May 2026 is Spring Bank Holiday (closed).
    // Rollover moves to Tuesday 26 May 2026 (first open court day).
    const input: TimeRuleInput = {
      ruleSet: 'CPR_2_8',
      startDate: '2026-05-18',
      numberOfDays: 6,
      direction: 'after',
      endDefinedByEvent: false,
      actAtCourtOffice: true,
      jurisdiction: 'England and Wales',
      timezone: 'Europe/London'
    };

    const res = TimeRuleEngine.calculate(input);
    expect(res.resultDate).toBe('2026-05-26'); // Tuesday 26 May 2026
    expect(res.courtClosureRolloverApplied).toBe(true);
    expect(res.ruleReferences).toContain('CPR 2.8(5)');
  });

  it('Vector 6 & 7 (Boundaries: numberOfDays=5 vs numberOfDays=6)', () => {
    // Starting on Thursday 7 May 2026:
    // With 5 days (<= 5): Friday (1), Sat (skip), Sun (skip), Mon (2), Tue (3), Wed (4), Thu (5).
    // Result: 14 May 2026.
    const res5 = TimeRuleEngine.calculate({
      ruleSet: 'CPR_2_8',
      startDate: '2026-05-07',
      numberOfDays: 5,
      direction: 'after',
      endDefinedByEvent: false,
      actAtCourtOffice: false,
      jurisdiction: 'England and Wales',
      timezone: 'Europe/London'
    });
    expect(res5.resultDate).toBe('2026-05-14');
    expect(res5.excludedDates.length).toBeGreaterThan(0);
    expect(res5.ruleReferences).toContain('CPR 2.8(4)');

    // With 6 days (> 5): Fri (1), Sat (2), Sun (3), Mon (4), Tue (5), Wed (6).
    // Result: 13 May 2026 (Ordinary weekends count).
    const res6 = TimeRuleEngine.calculate({
      ruleSet: 'CPR_2_8',
      startDate: '2026-05-07',
      numberOfDays: 6,
      direction: 'after',
      endDefinedByEvent: false,
      actAtCourtOffice: false,
      jurisdiction: 'England and Wales',
      timezone: 'Europe/London'
    });
    expect(res6.resultDate).toBe('2026-05-13');
    expect(res6.excludedDates.length).toBe(0);
    expect(res6.ruleReferences).not.toContain('CPR 2.8(4)');
  });

  it('rejects foreign jurisdictions and unsupported rule packs', () => {
    expect(() => {
      TimeRuleEngine.calculate({
        ruleSet: 'CPR_2_8',
        startDate: '2026-01-01',
        numberOfDays: 5,
        direction: 'after',
        endDefinedByEvent: false,
        actAtCourtOffice: false,
        jurisdiction: 'Scotland' as any,
        timezone: 'Europe/London'
      });
    }).toThrow('TimeRuleEngine only supports England and Wales');
  });
});
