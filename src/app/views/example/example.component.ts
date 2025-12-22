import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StatusStepperComponent } from "../../layouts/UI/status-stepper/status-stepper.component";
import { Calendar, ClipboardList, Package, Truck } from 'lucide-angular';
import { StatCardData, StatCardComponent } from '../../layouts/UI/stat-card/stat-card.component';
import { HttpClient } from '@angular/common/http';
import { UserCardData, UserCardComponent } from '../../layouts/UI/user-card/user-card.component';
import { DatePickerConfig, DateRangeEmit, DatePickerComponent } from '../../layouts/UI/date-picker/date-picker.component';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, StatusStepperComponent, StatCardComponent, UserCardComponent, DatePickerComponent],
  templateUrl: './example.component.html',
  styleUrl: './example.component.css'
})
export class ExampleComponent {



  

orders = [
  { id: 'SHP-5574', statusIndex: 2 }, // Bill done (matches row 1 in your image)
  { id: 'SHP-5575', statusIndex: 4 }, // All done (matches row 3)
  { id: 'SHP-5576', statusIndex: 0 }, // Draft (matches row 4)
];

handleCardAction(card: StatCardData) {
    console.log('Card Clicked:', card.title);
    // You can add routing logic here, e.g.:
    // this.router.navigate(['/details', card.id]);
  }


  singleConfig: DatePickerConfig = {
    type: 'single',
    label: 'Appointment Date',
    placeholder: 'Pick a day'
  };

  rangeConfig: DatePickerConfig = {
    type: 'both',
    label: 'Vacation Period',
    placeholder: 'Start Date - End Date'
  };

  result: any;

  handleSingleSelect(data: DateRangeEmit) {
    console.log('Single Date:', data.from);
    this.result = data;
  }

  handleRangeSelect(data: DateRangeEmit) {
    console.log('From:', data.from, 'To:', data.to);
    this.result = data;
  }




 users: UserCardData[] = [
    {
      id: 1,
      name: 'Talan Dias',
      role: 'UX Designer',
      isVerified: true
    },
    {
      id: 2,
      name: 'Lydia Gouse',
      role: 'Product Owner',
      isVerified: false
    }
  ];

  handleProfileApiCall(userId: string | number) {
    console.log('API CALL triggered for user:', userId);
  }

}
