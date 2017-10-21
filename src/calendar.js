import './moment-events.js';
import moment from 'moment/moment';
export default class Calendar {
  constructor(baseDate) {
    this.monthNameTypes = ['','Short'];
    this.weekdayNameTypes = ['','Short','Min'];
    this.intervalCodes = {
        year: 'y',
        month: 'M',
        week: 'w',
        day: 'd'
    };
    this.$now = baseDate ? moment(baseDate).startOf('day') : moment().startOf('day');
  }
  today (date) {
    return (date && (this.$now = moment(date).startOf('day'))) || this.$now;
  }
  currentDay(day) {
    return day ? new moment(day) : new moment();
  }
  addEvent(start, end, data) {
    return moment.event(start, end, data);
  }
  current (interval, format) {
    return this.buildCalendar(this.$now.clone(), interval, format);
  }
  next (interval, format) {
    return this.buildCalendar(this.$now.clone().add(1, this.intervalCodes[interval]), interval, format);
  }
  prev (interval, format) {
    return this.buildCalendar(this.$now.clone().subtract(1, this.intervalCodes[interval]), interval, format);
  }
  weekdayNames (type) {
    type === undefined ? (type=0) : void(0);
    typeof type === 'number' && (
      type = this.weekdayNameTypes[type % this.weekdayNameTypes.length]
    );
    return moment[`weekdays${this.cap(type)}`]();
  }
  cap (s) {
    return s.charAt(0).toUpperCase() + s.substring(1);
  }
  formatOrNot (input, format) {
    return format ? input.format(format) : input;
  }
  buildCalendar (base, interval, format, asCalView) {
    if(typeof format === "boolean") {
      asCalView = format;
      format = null;
    }
    asCalView = asCalView===undefined ? true : asCalView;
    let cal = [];
    let dtstart = moment(base).startOf(interval);
    let dtend = dtstart.clone().add(1, this.intervalCodes[interval]);
    if(asCalView) {
      dtstart.startOf('week');
      dtend.subtract(1,'day').endOf('week');
    }
    while(dtstart.isBefore(dtend)) {
      cal.push(this.formatOrNot(dtstart.clone(), format));
      dtstart.add(1, 'd');
    }
    return cal;
  }
}