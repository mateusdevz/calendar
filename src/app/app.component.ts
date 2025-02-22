import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as dayjs from 'dayjs';
import * as utc from "dayjs/plugin/utc";
import * as timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('firstDay', {static: true}) firstDayInput!: ElementRef;
  @ViewChild('secondDay', {static: true}) secondDayInput!: ElementRef;
  @ViewChild('closeModal') closeModal!: ElementRef


  title = 'calendar';
  private timezonea = dayjs.tz.guess() || 'America/Sao_Paulo';

  calendar: Day[][] = [];
  days = 0;
  today = Number(dayjs().tz(this.timezonea).format('DD'));
  firstDayRest = 0;
  secondDayRest = 0;
  currentMonth = dayjs().tz(this.timezonea).format('MMMM');  
  monthCurrentSaved = this.currentMonth;
  diffNextRest = 0;

  year = dayjs().year();
  month = dayjs().month() + 1;

  get nextRestDay(): number {
    if(this.firstDayInput && this.today < this.firstDayRest) {
      return this.firstDayRest - this.today;
    }

    if(this.secondDayRest && this.today < this.secondDayRest) {
      return this.secondDayRest - this.today;
    }

    return 0;
  }
 
  ngOnInit(): void {
    this.calendar = this.generateCalendar()
    this.days = Number(localStorage.getItem('day'));
    this.firstDayRest = Number(JSON.parse(localStorage.getItem('rest') as string).first);
    this.secondDayRest = Number(JSON.parse(localStorage.getItem('rest') as string).second);
    if(this.days) {
      this.stampDays();
    }

    if(this.firstDayRest && this.secondDayRest) {
      this.calendar = this.generateCalendar(undefined, Number(this.firstDayRest), Number(this.secondDayRest));
      this.stampDays();
    }
  }

  onChange(event: any) {
    this.days = Number(event.target.value);
    this.saveOnStorage(this.days);
    this.stampDays();
  } 

  stampDays(clear?: boolean): void {
    for(let i = 0; i < this.calendar.length; i++) {
      var row = this.calendar[i];
      for(let j = 0; j < row.length; j++) {
        this.calendar[i][j].selected = clear ? false : this.calendar[i][j].day % 2 === (this.days === DiasDeTrabalho.PAR ? 0 : 1); 
      }
    }
  }

  nextMonth() {
    this.calendar = this.generateCalendar(1, Number(this.firstDayRest), Number(this.secondDayRest));
    this.stampDays();
  }

  prevMonth() {
    this.calendar = this.generateCalendar(-1, Number(this.firstDayRest), Number(this.secondDayRest));
    this.stampDays();
  }

  clearCalendarOnNextOrPrev(): void {
    this.stampDays(true);
  }

  generateCalendar(isNextOrPrev?: number, firstRest?: number, secondRest?: number): any {
    if(isNextOrPrev && isNextOrPrev > 0) {
      this.month = this.month + 1;
      this.currentMonth = dayjs().tz(this.timezonea).month(this.month - 1).format('MMMM');
    }

    if(isNextOrPrev && isNextOrPrev < 0) {
      this.month = this.month - 1;
      this.currentMonth = dayjs().tz(this.timezonea).month(this.month - 1).format('MMMM');
    }

    this.handleWorkDayToggle();

    // Obter o número de dias no mês
    const daysInMonth = dayjs(`${this.year}-${this.month}-01`).daysInMonth();

    // Inicializar a matriz
    const calendar = Array(6).fill(0).map(() => Array(7).fill({day: 0, selected: false})); // 6 semanas, 7 dias

    // Preencher a matriz
    let week = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = dayjs(`${this.year}-${this.month}-${day}`);
      const dayOfWeek = date.day(); // 0 = Domingo, 6 = Sábado

      calendar[week][dayOfWeek] = {day, selected: false }; 

      if(this.currentMonth === this.monthCurrentSaved) {
        calendar[week][dayOfWeek].isRestDay = firstRest === day || secondRest === day;
      }

      // Avançar para a próxima semana se o dia for sábado
      if (dayOfWeek === 6) {
        week++;
      }
    }

    return calendar;
  }

  handleWorkDayToggle() {
    const prevMonth = this.month - 1;
    const daysInPrevMonth = dayjs(`${this.year}-${prevMonth}-01`).daysInMonth();
    if(daysInPrevMonth % 2 === 1 && this.today === 1) {
      this.days = DiasDeTrabalho.PAR;
      this.saveOnStorage(this.days);
    } else if(daysInPrevMonth % 2 === 0 && this.today === 1 && this.days === 2) {
      this.days =  DiasDeTrabalho.IMPAR;
      this.saveOnStorage(this.days);

    }
  
  }

  saveOnStorage(day: number): void {
    localStorage.setItem('day', JSON.stringify(day));
  }

  defineRest(): void {
    this.closeModal.nativeElement.click();

    const first = this.firstDayInput.nativeElement.value;
    const second = this.secondDayInput.nativeElement.value

    const restInfo = {
      first,
      second,
      month: this.currentMonth 
    };

    this.firstDayRest = restInfo.first;
    this.secondDayRest = restInfo.second;

    localStorage.setItem('rest', JSON.stringify(restInfo));

    this.calendar = this.generateCalendar(undefined, Number(restInfo.first), Number(restInfo.second));
    this.stampDays();
  }
}

export interface Day {
  day: number;
  selected: boolean;
  isRestDay: boolean;
}

export enum DiasDeTrabalho {
  PAR = 2,
  IMPAR = 3
}