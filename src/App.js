import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Calendar from './calendar.js';

class CalendarCompoent extends Component {
  constructor(props) {
    super(props);  
    this.nextMonth = this.nextMonth.bind(this);
    this.previousMonth = this.previousMonth.bind(this);
    this.addEventDate = this.addEventDate.bind(this);
    this.addEvent = this.addEvent.bind(this);
    this.continueToEventEditor = this.continueToEventEditor.bind(this);
    this.isCurrentMonth = this.isCurrentMonth.bind(this);

    this.calendar = this.props.calendar;
    this.tries = 0;
    this.today = this.calendar.today();
    this.weekdays = this.calendar.weekdayNames('Short');
    //this.form = "<form className='inputFields' value={this.state.calendarView}><input type='input' name='title' placeholder='Title' ref='title'></input><textarea type='input' placeholder='Description' ref='description'></textarea><input className='addEvent' type='button' onClick={this.addEvent}></input>{ this.state.showNotification ? <h4 className='notification'>{this.state.notification}</h4> : void (0) }</form>";
    this.state = {calendarView: true, from: 'From', to: 'To', month: this.calendar.today().format('MMMM'), year: this.calendar.today().format('YYYY'), days: this.calendar.current('month'), showNotification: false, notification: null};
  }

  nextMonth() {
    if (!this.state.calendarView) {
      this.toggleEventEditor();
    } else {
      this.calendar.today().add(1, 'month');
      this.updateStateDates();
    }
  }

  updateStateDates() {
    this.setState({month: this.calendar.today().format('MMMM'), year: this.calendar.today().format('YYYY'), days: this.calendar.current('month')});
  }

  previousMonth() {
    if (!this.state.calendarView) {
      this.toggleEventEditor();
    } else {
      this.calendar.today().subtract(1, 'month');
      this.updateStateDates();
    }
  }

  isToday(dt) {
    return dt ? dt.clone().startOf('day').isSame(this.calendar.currentDay().startOf('day')) && dt.clone().startOf('month').isSame(this.calendar.currentDay().startOf('month')) : undefined;
  }

  isCurrentMonth(dt) {
    return (dt.month() !== this.calendar.today().month()).toString();
  }

  toggleEventEditor() {
    this.datesAreSet() && this.setState({calendarView: !this.state.calendarView, showNotification: false, notification: null});
    return this;
  }

  datesAreSet() {
    return this.state.to !== 'To' && this.state.from !== 'From';
  }

  notice(text, time) {
    this.setState({showNotification: true, notification: text});
    setTimeout(() => {
      this.setState({showNotification: false, notification: null});
    }, time);
  }

  continueToEventEditor() {
    if (!this.datesAreSet()) {
      this.notice('Event dates should not be empty', 3000);
    } else {
      this.toggleEventEditor();
    }
  }

  addEventDate(e) {
    let value = e.day.format('LL');
    if (this.tries === 0) {
      this.setState({from: value});
    } else if (this.tries === 1) {
      let check = e.day.isBefore(this.state.from);
      this.setState({to: check ? this.state.from : value, from: check ? value : this.state.from}); 
      check && this.notice('End date should be greater than start date', 5000);
    }
    this.tries = (this.tries >= 1) ? 0 : ++this.tries;
  }

  addEvent(e) {
    let title = this.refs.title.value;
    let description = this.refs.description.value;
    if (title.length >= 5 && description.length >= 5) {
      let newEvent = this.calendar.addEvent(this.state.from, this.state.to, {title: title, description: description});
      this.props.addEvent({from:newEvent.getStart('l'), to:newEvent.getEnd('l'), title:newEvent.data().title, description:newEvent.data().description});
      this.toggleEventEditor().setState({from: 'From', to: 'To'});
    } else {
      this.notice('Title & description require a minimum of 5 letters', 3000);
    }
  }

  render() {
    return (
      <nav className='calendarComponent'>
          <span className='close visible' onClick={this.props.toggle.bind(null, false)}></span>
          <div className='navigation'>
            <div className="previous calNav" tabIndex="0" onClick={this.previousMonth}></div>
            <h3 className='currentMonth'><b>{this.state.month}</b> <span>{this.state.year}</span></h3>
            <div className="next calNav" tabIndex="0" onClick={this.nextMonth}></div>
          </div>
        {
          this.state.calendarView ? 
          <span>
            <ul className='weekDaysList'>{
              this.weekdays.map(function(current, index, array) {
                return <li className='weekday' key={index}>{current}</li>
              })
            }</ul>
            <ul className='monthDaysList'>{
              this.state.days.map((day, index, array) => {
                return <li value={this.isToday(day)} dim={this.isCurrentMonth(day)} className='day' key={index} onClick={this.addEventDate.bind(this, {key: index, value:day.format("D"), day: day})}>{day.format("D")}</li>
              })
            }</ul>
            <form className="inputFields">
              <input type="input" disabled='1' name="from" placeholder={this.state.from}></input>
              <input type="input" disabled='1' name="to" placeholder={this.state.to}></input>
              <input className='addEvent' type="button" name="addEvent" value='Continue' onClick={this.continueToEventEditor}></input>
              { this.state.showNotification ?
                <h4 className='notification'>{this.state.notification}</h4>
                : void (0)
              }
            </form>
          </span>
          :
          <form className="inputFields">
            <input type="input" name="title" placeholder='Title' ref='title'></input>
            <textarea type="input" name="description" placeholder='Description' ref='description'></textarea>
            <input className='addEvent' type="button" name="addEvent" value='Add Event' onClick={this.addEvent}></input>
            { this.state.showNotification ?
              <h4 className='notification'>{this.state.notification}</h4>
              : void (0)
            }
          </form>
        }
      </nav>
    );
  }
}

export default class App extends Component {

  constructor(props) {
    super(props);  
    this.toggleCalendarView = this.toggleCalendarView.bind(this);
    this.addEvent = this.addEvent.bind(this);
    this.removeStoreItem = this.removeStoreItem.bind(this);

    this.hasLocalStorage = typeof window.localStorage === 'object';
    this.calendar = new Calendar();
    this.state = {
      childVisible: false,
      events: [] 
    };
  }

  addEvent(data) {
    let events = this.state.events;
    events = events.concat(data);
    this.setStoreItem(data).sortByDate(events);
  }

  setStoreItem(data) {
    let id = data.title.replace(/\s/g, '');
    window.localStorage.setItem(`event-${id}`, JSON.stringify(data));
    return this;
  }

  removeStoreItem(data) {
    let id = data.title.replace(/\s/g, '');
    window.localStorage.removeItem(`event-${id}`);
    this.state.events.splice(data.index, 1);
    this.setState({events: this.state.events});
  }

  toggleCalendarView(show) {
    this.setState({childVisible: show ? show : !this.state.childVisible});
  }

  sortByDate(events) {
    let Events = events ? events : this.state.events;
    Events.sort((curr, next) => {
      return this.calendar.currentDay(next.from) - this.calendar.currentDay(curr.from);
    });
    this.setState({events: Events});
  }

  sortByLetter(events) {
    let Events = events ? events : this.state.events;
    Events.sort((curr, next) => {
      return (next.title - curr.title);
    });
    this.setState({events: Events});
  }

  componentDidMount() {
    if (this.hasLocalStorage) {
      let key;
      let localdata = window.localStorage;
      let events = this.state.events;
      for (key in localdata) {
        if (key.match(/^event-/)) {
          events = events.concat(JSON.parse(localdata[key]));
        }
      }
      this.sortByDate(events);
    }
  }

  render() {
    return (
      <div>
        <nav className="navbar">
          <img src={logo} className="feather" alt="feather" onClick={this.toggleCalendarView.bind(this, true)}/>
          <h1 className="App-title">Welcome To Event Manager</h1>
        </nav>
          <div className='eventsList'>
            {
              this.state.childVisible
                ? <CalendarCompoent calendar={this.calendar} addEvent={this.addEvent} toggle={this.toggleCalendarView.bind(null)}/>
                : void(0)
            }
            {
              this.state.events.length > 0 ?
               <span> 
                  <ul className='eventListing'> {
                    this.state.events.map((current, index, array) => {
                      return <li className='event' key={index}>
                        <h2>{current.title}</h2>
                        <h4>{current.description}</h4>
                        <span className='eventDates'>
                          <span>{current.from}</span><b>to</b>
                          <span>{current.to}</span>
                        </span>
                        <span className='close remove' onClick={this.removeStoreItem.bind(this, {title: current.title, index:index})}></span>
                      </li>
                    })
                  }</ul>
                </span>
                : <h3 className='emptyEvent'>You May Start Adding Some Life Events</h3>
            }
          </div>
      </div>
    );
  }
}