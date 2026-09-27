export interface CalendarEvent {
  id: string;
  matterId: string;
  title: string;
  description: string;
  location?: string;
  startDate: string; // ISO string or YYYY-MM-DDTHH:mm:ss
  endDate?: string;
  isAllDay?: boolean;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  category?: 'court_hearing' | 'statutory_deadline' | 'cpr_response' | 'client_conference';
}

export class IcsHandler {
  /**
   * Generates a standard RFC 5545 iCalendar (.ics) string.
   */
  public static generateIcs(events: CalendarEvent[]): string {
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ATKIN//Court Calendar v1.0//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    for (const evt of events) {
      const dtStart = this.formatIcsDate(evt.startDate);
      const dtEnd = evt.endDate ? this.formatIcsDate(evt.endDate) : dtStart;
      const now = this.formatIcsDate(new Date().toISOString());

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${evt.id}@atkin.local`);
      lines.push(`DTSTAMP:${now}`);
      lines.push(`DTSTART:${dtStart}`);
      lines.push(`DTEND:${dtEnd}`);
      lines.push(`SUMMARY:${this.escapeIcsText(evt.title)}`);
      lines.push(`DESCRIPTION:${this.escapeIcsText(evt.description)}`);
      if (evt.location) {
        lines.push(`LOCATION:${this.escapeIcsText(evt.location)}`);
      }
      lines.push('STATUS:CONFIRMED');
      if (evt.priority === 'HIGH') {
        lines.push('PRIORITY:1');
      } else if (evt.priority === 'MEDIUM') {
        lines.push('PRIORITY:5');
      } else {
        lines.push('PRIORITY:9');
      }
      lines.push('BEGIN:VALARM');
      lines.push('TRIGGER:-P1D'); // 1 day before
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:Court / Statutory Deadline Reminder: ${this.escapeIcsText(evt.title)}`);
      lines.push('END:VALARM');
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  /**
   * Parses an iCalendar (.ics) string into CalendarEvents.
   */
  public static parseIcs(icsText: string, matterId: string): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const eventBlocks = icsText.split(/BEGIN:VEVENT/i).slice(1);

    for (const block of eventBlocks) {
      const getField = (fieldName: string): string => {
        const m = block.match(new RegExp(`^${fieldName}:(.*)$`, 'im'));
        return m ? m[1].trim() : '';
      };

      const summary = getField('SUMMARY');
      const description = getField('DESCRIPTION');
      const location = getField('LOCATION');
      const dtStart = getField('DTSTART');
      const uid = getField('UID') || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      if (summary) {
        events.push({
          id: uid.replace(/@(?:proofline|atkin)\.local$/, ''),
          matterId,
          title: this.unescapeIcsText(summary),
          description: this.unescapeIcsText(description),
          location: location ? this.unescapeIcsText(location) : undefined,
          startDate: this.parseIcsDate(dtStart),
          priority: block.includes('PRIORITY:1') ? 'HIGH' : 'MEDIUM'
        });
      }
    }

    return events;
  }

  private static formatIcsDate(isoString: string): string {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private static parseIcsDate(icsDateStr: string): string {
    if (!icsDateStr) return new Date().toISOString();
    // Format YYYYMMDDTHHMMSSZ
    const match = icsDateStr.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z`;
    }
    return new Date().toISOString();
  }

  private static escapeIcsText(text: string): string {
    return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }

  private static unescapeIcsText(text: string): string {
    return text.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
  }
}
