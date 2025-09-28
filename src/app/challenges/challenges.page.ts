import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ChallengeService } from './challenge.service';
import { ChallengeSummary, ChallengeScheduleStatus, CreateChallengeData } from './models';
import { StatusIconComponent } from '../shared/ui/status-icon.component';
import { CreateChallengeDialogComponent } from './create-challenge-dialog.component';

@Component({
  selector: 'app-challenges-page',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusIconComponent, CreateChallengeDialogComponent],
  templateUrl: './challenges.page.html',
  styleUrls: ['./challenges.page.scss']
})
export class ChallengesPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  challenges: ChallengeSummary[] = [];
  isLoading = false;
  error: string | null = null;
  activeTab: ChallengeScheduleStatus = 'active';
  
  // Create challenge dialog state
  showCreateDialog = false;
  isCreatingChallenge = false;
  
  // Delete challenge dialog state
  showDeleteDialog = false;
  isDeletingChallenge = false;
  challengeToDelete: { challengeId: number; name: string } | null = null;
  
  @ViewChild(CreateChallengeDialogComponent) createDialog!: CreateChallengeDialogComponent;
  
  tabs = [
    { id: 'active' as ChallengeScheduleStatus, label: 'Active', statusIcon: 'active' as const },
    { id: 'expired' as ChallengeScheduleStatus, label: 'Expired', statusIcon: 'expired' as const },
    { id: 'scheduled' as ChallengeScheduleStatus, label: 'Scheduled', statusIcon: 'scheduled' as const }
  ];

  tabCounts: Record<string, number> = {
    active: 0,
    expired: 0,
    scheduled: 0
  };

  constructor(
    private challengeService: ChallengeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadChallenges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTabClick(tabId: ChallengeScheduleStatus): void {
    this.activeTab = tabId;
    this.loadChallenges();
  }

  loadChallenges(): void {
    this.isLoading = true;
    this.error = null;

    this.challengeService.list(this.activeTab)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (challenges) => {
          this.challenges = challenges.map(this.mapToChallengeSummary);
          this.updateTabCounts();
        },
        error: (error) => {
          console.error('Failed to load challenges:', error);
          this.error = 'Failed to load challenges. Please try again.';
        }
      });
  }

  private mapToChallengeSummary(response: any): ChallengeSummary {
    return {
      challengeId: response.challengeId,
      name: response.name,
      startDate: response.startDate,
      endDate: response.endDate,
      scheduleStatus: response.scheduleStatus,
      completionStatus: response.completionStatus,
      successPercent: response.successPercent
    };
  }

  private updateTabCounts(): void {
    // In a real app, you'd get counts from the API
    this.tabCounts = {
      active: this.challenges.filter(c => c.scheduleStatus === 'active').length,
      expired: this.challenges.filter(c => c.scheduleStatus === 'expired').length,
      scheduled: this.challenges.filter(c => c.scheduleStatus === 'scheduled').length
    };
  }

  getActiveTabLabel(): string {
    const tab = this.tabs.find(t => t.id === this.activeTab);
    return tab?.label || 'Challenges';
  }

  getStatusIcon(status: ChallengeScheduleStatus): 'active' | 'expired' | 'scheduled' | 'deleted' {
    return status;
  }

  getStatusLabel(status: ChallengeScheduleStatus): string {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'scheduled':
        return 'Scheduled';
      case 'deleted':
        return 'Deleted';
      default:
        return 'Unknown';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  trackByChallengeId(index: number, challenge: ChallengeSummary): number {
    return challenge.challengeId;
  }

  createChallenge(): void {
    console.log('Create challenge button clicked');
    this.showCreateDialog = true;
  }

  onCreateDialogClose(): void {
    this.showCreateDialog = false;
  }

  onCreateDialogCreate(challengeData: CreateChallengeData): void {
    this.isCreatingChallenge = true;
    
    // Update dialog state
    if (this.createDialog) {
      this.createDialog.setCreatingState(true);
    }
    
    this.challengeService.create(challengeData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isCreatingChallenge = false;
          if (this.createDialog) {
            this.createDialog.setCreatingState(false);
          }
        })
      )
      .subscribe({
        next: (createdChallenge) => {
          console.log('Challenge created successfully:', createdChallenge);
          this.showCreateDialog = false;
          
          // Refresh the challenges list
          this.loadChallenges();
          
          // Navigate to the new challenge detail page
          this.router.navigate(['/challenges', createdChallenge.challengeId]);
        },
        error: (error) => {
          console.error('Failed to create challenge:', error);
          this.error = 'Failed to create challenge. Please try again.';
        }
      });
  }

  confirmDeleteChallenge(challengeId: number, challengeName: string): void {
    this.challengeToDelete = { challengeId, name: challengeName };
    this.showDeleteDialog = true;
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.challengeToDelete = null;
  }

  deleteChallenge(): void {
    if (!this.challengeToDelete) return;

    this.isDeletingChallenge = true;
    
    this.challengeService.deleteChallenge(this.challengeToDelete.challengeId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isDeletingChallenge = false)
      )
      .subscribe({
        next: () => {
          console.log('Challenge deleted successfully');
          this.showDeleteDialog = false;
          this.challengeToDelete = null;
          
          // Refresh the challenges list
          this.loadChallenges();
        },
        error: (error) => {
          console.error('Failed to delete challenge:', error);
          this.error = 'Failed to delete challenge. Please try again.';
        }
      });
  }
}
