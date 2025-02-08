import { Component, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'calendar';

  calendar: Day[][] = [];
  days = 0;

  ngOnInit(): void {
    this.calendar = this.generateCalendar()
  }

  onChange(event: any) {
    this.days = Number(event.target.value);

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

  generateCalendar(): any {
    // Configurações
    const year = 2025;
    const month = 1; // Janeiro (1 = Janeiro)

    // Obter o número de dias no mês
    const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();

    // Inicializar a matriz
    const calendar = Array(6).fill(0).map(() => Array(7).fill({day: 0, selected: false})); // 6 semanas, 7 dias

    // Preencher a matriz
    let week = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = dayjs(`${year}-${month}-${day}`);
      const dayOfWeek = date.day(); // 0 = Domingo, 6 = Sábado
      calendar[week][dayOfWeek] = {day, selected: false};

      // Avançar para a próxima semana se o dia for sábado
      if (dayOfWeek === 6) {
        week++;
      }
    }

    console.log(calendar);
    return calendar;
  }
}

export interface Day {
  day: number;
  selected: boolean;
}