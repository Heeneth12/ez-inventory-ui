import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

// --- Interfaces for Data Structure ---
interface Step {
  id: number;
  label: string;
  status: 'pending' | 'processing' | 'completed';
}

interface TimelineEvent {
  title: string;
  location: string;
  date: string;
  time: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-tracker.component.html',
  styleUrls: ['./order-tracker.component.css']
})
export class OrderTrackerComponent implements OnInit, OnDestroy {
  
  // --- State Variables ---
  currentStepIndex = 0;
  simulationInterval: any;
  
  // Top Horizontal Progress Steps (Your requested flow)
  steps: Step[] = [
    { id: 1, label: 'Sales Order', status: 'processing' }, // Start here
    { id: 2, label: 'Invoice', status: 'pending' },
    { id: 3, label: 'Delivery', status: 'pending' },
    { id: 4, label: 'Payment', status: 'pending' },
    { id: 5, label: 'Completed', status: 'pending' }
  ];

  // Vertical Timeline Data (Bottom Left Card)
  timelineEvents: TimelineEvent[] = [
    { 
      title: 'Sales Order Created', 
      location: 'System Approval', 
      date: '09 June 2025', 
      time: '08:00 AM', 
      isCompleted: true, 
      isCurrent: false 
    },
    { 
      title: 'In Transit', 
      location: '2118 Thornridge Cir. Syracuse, CT', 
      date: '09 June 2025', 
      time: '10:30 AM', 
      isCompleted: false, 
      isCurrent: true 
    },
    { 
      title: 'Delivery', 
      location: '4517 Washington Ave. Manchester, KY', 
      date: '10 June 2025', 
      time: '08:00 AM', 
      isCompleted: false, 
      isCurrent: false 
    },
    { 
      title: 'Payment Confirmed', 
      location: 'Bank Transaction ID: #9921', 
      date: '12 June 2025', 
      time: '02:00 PM', 
      isCompleted: false, 
      isCurrent: false 
    }
  ];

  // Dummy Map Markers positions (top/left percentages)
  mapPositions = [
    { top: '20%', left: '10%' }, // Sales Order
    { top: '30%', left: '25%' }, // Invoice
    { top: '50%', left: '50%' }, // Delivery (Middle of map)
    { top: '60%', left: '70%' }, // Payment
    { top: '70%', left: '85%' }, // Completed
  ];
  
  currentMapPos = this.mapPositions[0];

  ngOnInit() {
    this.startSimulation();
  }

  ngOnDestroy() {
    if (this.simulationInterval) clearInterval(this.simulationInterval);
  }

  startSimulation() {
    this.simulationInterval = setInterval(() => {
      this.advanceWorkflow();
    }, 3000); // Updates every 3 seconds
  }

  advanceWorkflow() {
    // 1. Update Horizontal Steps
    if (this.currentStepIndex < this.steps.length) {
      // Mark current as completed
      this.steps[this.currentStepIndex].status = 'completed';
      
      // Move to next
      this.currentStepIndex++;
      
      if (this.currentStepIndex < this.steps.length) {
        this.steps[this.currentStepIndex].status = 'processing';
        this.currentMapPos = this.mapPositions[this.currentStepIndex];
        
        // Update Vertical Timeline logic simulates syncing with main steps
        this.updateVerticalTimeline(this.currentStepIndex);
      } else {
        // Workflow finished
        clearInterval(this.simulationInterval);
      }
    }
  }

  updateVerticalTimeline(stepIndex: number) {
    // Simple logic to mark vertical items complete as main steps progress
    // This maps the 5 main steps roughly to the 4 timeline events
    if (stepIndex > 0 && stepIndex <= this.timelineEvents.length) {
      const timelineIdx = stepIndex - 1;
      this.timelineEvents[timelineIdx].isCompleted = true;
      this.timelineEvents[timelineIdx].isCurrent = false;
      
      if (timelineIdx + 1 < this.timelineEvents.length) {
        this.timelineEvents[timelineIdx + 1].isCurrent = true;
      }
    }
  }
}