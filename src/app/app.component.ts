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
  firstDayRest = 0;
  secondDayRest = 0;
  currentMonth = dayjs().tz(this.timezonea).format('MMMM');  

  year = dayjs().year();
  month = dayjs().month() + 1;
 
  ngOnInit(): void {
    this.calendar = this.generateCalendar()
    this.days = Number(localStorage.getItem('day'));
    this.firstDayRest = Number(localStorage.getItem('primeiroDiaFolga'));
    this.secondDayRest = Number(localStorage.getItem('segundaDiaFolga'));
    if(this.days) {
      this.stampDays();
    }

    if(this.firstDayInput && this.secondDayRest) {
      this.calendar = this.generateCalendar(undefined, Number(this.firstDayRest), Number(this.secondDayRest));
      this.stampDays();
    }
  }

  onChange(event: any) {
    this.days = Number(event.target.value);
    this.saveOnStorage(this.days);
    this.stampDays();
  } 

  stampDays(): void {
    for(let i = 0; i < this.calendar.length; i++) {
      var row = this.calendar[i];
      for(let j = 0; j < row.length; j++) {
        
        if(this.days === 2) {
          this.calendar[i][j].selected = this.calendar[i][j].day % 2 === 0; 
        } else {
          this.calendar[i][j].selected = this.calendar[i][j].day % 2 === 1; 
        }
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

  generateCalendar(isNextOrPrev?: number, firstRest?: number, secondRest?: number): any {
    if(isNextOrPrev && isNextOrPrev > 0) {
      this.month = this.month + 1;
      this.currentMonth = dayjs().tz(this.timezonea).month(this.month - 1).format('MMMM');      
    }

    if(isNextOrPrev && isNextOrPrev < 0) {
      this.month = this.month - 1;
      this.currentMonth = dayjs().tz(this.timezonea).month(this.month - 1).format('MMMM');
    }


    // Obter o número de dias no mês
    const daysInMonth = dayjs(`${this.year}-${this.month}-01`).daysInMonth();

    // Inicializar a matriz
    const calendar = Array(6).fill(0).map(() => Array(7).fill({day: 0, selected: false})); // 6 semanas, 7 dias

    // Preencher a matriz
    let week = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = dayjs(`${this.year}-${this.month}-${day}`);
      const dayOfWeek = date.day(); // 0 = Domingo, 6 = Sábado
      calendar[week][dayOfWeek] = {day, selected: false, isRestDay: firstRest === day || secondRest === day};

      // Avançar para a próxima semana se o dia for sábado
      if (dayOfWeek === 6) {
        week++;
      }
    }

    return calendar;
  }

  saveOnStorage(day: number): void {
    localStorage.setItem('day', JSON.stringify(day));
  }

  defineRest(): void {
    this.closeModal.nativeElement.click();
    const firstRest = this.firstDayInput.nativeElement.value;
    const secondRest = this.secondDayInput.nativeElement.value
    localStorage.setItem('primeiroDiaFolga', firstRest);
    localStorage.setItem('segundaDiaFolga', secondRest);

    this.calendar = this.generateCalendar(undefined, Number(firstRest), Number(secondRest));
    this.stampDays();
  }
}

export interface Day {
  day: number;
  selected: boolean;
  isRestDay: boolean;
}