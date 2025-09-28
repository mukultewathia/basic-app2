import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.scss']
})
export class StatusIconComponent {
  @Input() status: 'completed' | 'missed' | 'unknown' | 'scheduled' | 'active' | 'expired' | 'deleted' = 'unknown';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  getIcon(): string {
    switch (this.status) {
      case 'completed':
        return '✔';
      case 'missed':
        return '✖';
      case 'unknown':
        return '•';
      case 'scheduled':
        return '📅';
      case 'active':
        return '🔥';
      case 'expired':
        return '⏰';
      case 'deleted':
        return '🗑️';
      default:
        return '•';
    }
  }

  getStatusClass(): string {
    return `status-${this.status}`;
  }

  getAriaLabel(): string {
    switch (this.status) {
      case 'completed':
        return 'Completed';
      case 'missed':
        return 'Missed';
      case 'unknown':
        return 'Unknown status';
      case 'scheduled':
        return 'Scheduled';
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'deleted':
        return 'Deleted';
      default:
        return 'Unknown status';
    }
  }

  getTooltipText(): string {
    switch (this.status) {
      case 'completed':
        return 'Habit completed';
      case 'missed':
        return 'Habit missed';
      case 'unknown':
        return 'Status unknown';
      case 'scheduled':
        return 'Challenge scheduled';
      case 'active':
        return 'Challenge active';
      case 'expired':
        return 'Challenge expired';
      case 'deleted':
        return 'Challenge deleted';
      default:
        return 'Unknown status';
    }
  }
}
