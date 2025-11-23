import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { HabitsStore } from '../habits.store';
import { CalendarService } from '../calendar.service';
import { Habit, HabitEntry } from '../models';

interface CorrelationResult {
    habitAId: number;
    habitAName: string;
    habitBId: number;
    habitBName: string;
    phi: number;
    phiSmoothed: number;
    coOccurrencePercent: number;
    confidence: 'Low' | 'Medium' | 'High';
    summary: string;
    stats: {
        a: number; // Both 1
        b: number; // A=1, B=0
        c: number; // A=0, B=1
        d: number; // Both 0
        n: number; // Total days
    };
    relationshipScore: number;
    relationshipType: 'Positive' | 'Negative' | 'Neutral';
}

@Component({
    selector: 'app-habit-correlation',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './habit-correlation.component.html',
    styleUrls: ['./habit-correlation.component.scss']
})
export class HabitCorrelationComponent implements OnInit, OnDestroy {
    correlations: CorrelationResult[] = [];
    selectedHabits: Habit[] = [];
    startDate: string = '';
    endDate: string = '';
    habitStats: { name: string, daysPerformed: number, totalDays: number, completionRate: number }[] = [];

    dateRangeType: 'current_month' | 'previous_month' | 'last_x_days' | 'custom' = 'current_month';
    lastXDays: number = 30;
    maxDate: string = '';

    private subscriptions = new Subscription();
    private lastEntriesMap: Map<number, HabitEntry[]> = new Map();
    private lastSelectedIds: number[] = [];

    constructor(
        private habitsStore: HabitsStore,
        private calendarService: CalendarService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.maxDate = this.calendarService.formatDate(new Date());
    }

    ngOnInit(): void {
        // Subscribe to query params for date range initialization
        const routeSub = this.route.queryParams.subscribe(params => {
            const range = params['range'];
            if (range) {
                this.dateRangeType = range as any;
            }

            if (params['lastX']) {
                this.lastXDays = Number(params['lastX']);
            }

            if (this.dateRangeType === 'custom' && params['start'] && params['end']) {
                this.startDate = params['start'];
                this.endDate = params['end'];
            } else {
                this.updateDateRange();
            }

            // Trigger calculation if we have data
            if (this.lastSelectedIds.length > 0) {
                this.calculateCorrelations(this.lastSelectedIds, this.lastEntriesMap);
            }
        });
        this.subscriptions.add(routeSub);

        const stateSubscription = combineLatest([
            this.habitsStore.selectedHabitIds$,
            this.habitsStore.entriesByHabitId$
        ]).subscribe(([selectedIds, entriesMap]) => {
            this.lastSelectedIds = selectedIds;
            this.lastEntriesMap = entriesMap;

            this.selectedHabits = selectedIds
                .map(id => this.habitsStore.getHabitById(id))
                .filter((h): h is Habit => !!h);

            this.calculateCorrelations(selectedIds, entriesMap);
        });

        this.subscriptions.add(stateSubscription);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    onDateRangeTypeChange(event: any): void {
        this.dateRangeType = event.target.value;
        this.updateDateRange();
        this.updateUrl();
    }

    onLastXDaysChange(event: any): void {
        this.lastXDays = Number(event.target.value);
        if (this.lastXDays < 1) this.lastXDays = 1;
        this.updateDateRange();
        this.updateUrl();
    }

    private updateDateRange(): void {
        const today = new Date();

        switch (this.dateRangeType) {
            case 'current_month': {
                const start = new Date(today.getFullYear(), today.getMonth(), 1);
                let end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

                // If end of month is in future, cap at today
                if (end > today) {
                    end = today;
                }

                this.startDate = this.calendarService.formatDate(start);
                this.endDate = this.calendarService.formatDate(end);
                break;
            }
            case 'previous_month': {
                const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const end = new Date(today.getFullYear(), today.getMonth(), 0);
                this.startDate = this.calendarService.formatDate(start);
                this.endDate = this.calendarService.formatDate(end);
                break;
            }
            case 'last_x_days': {
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - this.lastXDays);
                this.startDate = this.calendarService.formatDate(start);
                this.endDate = this.calendarService.formatDate(end);
                break;
            }
            case 'custom':
                // Do not auto-update dates, let user pick
                break;
        }
    }

    onStartDateChange(event: any): void {
        this.startDate = event.target.value;
        if (this.dateRangeType !== 'custom') {
            this.dateRangeType = 'custom';
        }
        this.updateUrl();
    }

    onEndDateChange(event: any): void {
        let newEndDate = event.target.value;

        // Prevent future dates
        if (newEndDate > this.maxDate) {
            newEndDate = this.maxDate;
            // Force update the input value if needed (though binding should handle it)
            event.target.value = this.maxDate;
        }

        this.endDate = newEndDate;
        if (this.dateRangeType !== 'custom') {
            this.dateRangeType = 'custom';
        }
        this.updateUrl();
    }

    private updateUrl(): void {
        const queryParams: any = {
            range: this.dateRangeType,
            lastX: null,
            start: null,
            end: null
        };

        if (this.dateRangeType === 'last_x_days') {
            queryParams.lastX = this.lastXDays;
        }

        if (this.dateRangeType === 'custom') {
            queryParams.start = this.startDate;
            queryParams.end = this.endDate;
        }

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: queryParams,
            queryParamsHandling: 'merge',
            replaceUrl: true
        });
    }

    /**
   * Calculates correlations between all pairs of selected habits.
   * Iterates through all unique pairs and processes them.
   *
   * @param habitIds - Array of selected habit IDs
   * @param entriesMap - Map of habit ID to its list of entries
   */
    private calculateCorrelations(
        habitIds: number[],
        entriesMap: Map<number, HabitEntry[]>
    ): void {
        this.correlations = [];
        this.calculateHabitStats(habitIds, entriesMap);

        if (habitIds.length < 2) {
            return;
        }

        for (let i = 0; i < habitIds.length; i++) {
            for (let j = i + 1; j < habitIds.length; j++) {
                this.processHabitPair(habitIds[i], habitIds[j], entriesMap);
            }
        }

        // Sort by confidence: High > Medium > Low
        this.correlations.sort((a, b) => {
            return this.getConfidenceWeight(b.confidence) - this.getConfidenceWeight(a.confidence);
        });
    }

    private getConfidenceWeight(confidence: string): number {
        switch (confidence) {
            case 'High': return 3;
            case 'Medium': return 2;
            case 'Low': return 1;
            default: return 0;
        }
    }

    private calculateHabitStats(habitIds: number[], entriesMap: Map<number, HabitEntry[]>): void {
        this.habitStats = [];

        habitIds.forEach(id => {
            const habit = this.habitsStore.getHabitById(id);
            if (!habit) return;

            const entries = entriesMap.get(id) || [];

            // Filter entries within the selected date range
            // Note: We need to consider the full range, not just days with entries.
            // But for "Total Days", we can calculate the difference between start and end date.

            const start = new Date(this.startDate);
            const end = new Date(this.endDate);
            const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            const daysPerformed = entries.filter(e =>
                e.date >= this.startDate &&
                e.date <= this.endDate &&
                e.isCompleted
            ).length;

            this.habitStats.push({
                name: habit.name,
                daysPerformed,
                totalDays,
                completionRate: totalDays > 0 ? (daysPerformed / totalDays) * 100 : 0
            });
        });
    }

    /**
     * Processes a single pair of habits to calculate their correlation metrics.
     * 1. Finds common days where both habits have an entry
     * 2. Builds a contingency table
     * 3. Calculates Phi coefficient and confidence
     * 4. Generates a summary and adds the result to the correlations list
     * 
     * @param idA - ID of the first habit
     * @param idB - ID of the second habit
     * @param entriesMap - Map of habit ID to its list of entries
     */
    private processHabitPair(
        idA: number,
        idB: number,
        entriesMap: Map<number, HabitEntry[]>
    ): void {
        const habitA = this.habitsStore.getHabitById(idA);
        const habitB = this.habitsStore.getHabitById(idB);

        if (!habitA || !habitB) return;

        const entriesA = (entriesMap.get(idA) || [])
            .filter(e => e.date >= this.startDate && e.date <= this.endDate);
        const entriesB = (entriesMap.get(idB) || [])
            .filter(e => e.date >= this.startDate && e.date <= this.endDate);

        // 1. Get common days where BOTH habits have an entry
        const commonDays = this.getCommonDays(entriesA, entriesB);

        if (commonDays.length === 0) return;

        // 2. Build contingency table
        const { a, b, c, d } = this.buildContingencyTable(commonDays, entriesA, entriesB);
        const n = a + b + c + d;

        // 3. Calculate Phi
        const phi = this.calculatePhi(a, b, c, d);
        const phiSmoothed = this.calculateSmoothedPhi(a, b, c, d);

        // 4. Determine Confidence
        const confidence = this.calculateConfidence(n, a, b, c);

        // 5. Generate Summary
        const summary = this.generateSummary(phiSmoothed, confidence, habitA.name, habitB.name);

        const relationshipScore = Math.abs(phiSmoothed) * 100;
        let relationshipType: 'Positive' | 'Negative' | 'Neutral' = 'Neutral';

        if (Math.abs(phiSmoothed) < 0.1) {
            relationshipType = 'Neutral';
        } else {
            relationshipType = phiSmoothed > 0 ? 'Positive' : 'Negative';
        }

        this.correlations.push({
            habitAId: idA,
            habitAName: habitA.name,
            habitBId: idB,
            habitBName: habitB.name,
            phi: phi ?? 0,
            phiSmoothed,
            coOccurrencePercent: n > 0 ? (a / n) * 100 : 0,
            confidence: confidence as 'Low' | 'Medium' | 'High',
            summary,
            stats: { a, b, c, d, n },
            relationshipScore,
            relationshipType
        });
    }

    /**
     * Finds the intersection of dates between two lists of habit entries.
     * Only days present in both lists are returned.
     * 
     * @param entriesA - List of entries for habit A
     * @param entriesB - List of entries for habit B
     * @returns Array of date strings present in both lists
     */
    private getCommonDays(entriesA: HabitEntry[], entriesB: HabitEntry[]): string[] {
        const datesA = new Set(entriesA.map(e => e.date));
        return entriesB
            .map(e => e.date)
            .filter(date => datesA.has(date));
    }

    /**
     * Builds a 2x2 contingency table for the two habits based on common days.
     * a: Both habits performed (1,1)
     * b: Habit A performed, Habit B not (1,0)
     * c: Habit A not performed, Habit B performed (0,1)
     * d: Neither habit performed (0,0)
     * 
     * @param days - List of common dates to analyze
     * @param entriesA - Entries for habit A
     * @param entriesB - Entries for habit B
     * @returns Object containing counts for a, b, c, d
     */
    private buildContingencyTable(
        days: string[],
        entriesA: HabitEntry[],
        entriesB: HabitEntry[]
    ) {
        let a = 0; // Both 1
        let b = 0; // A=1, B=0
        let c = 0; // A=0, B=1
        let d = 0; // Both 0

        // Create maps for faster lookup
        const mapA = new Map(entriesA.map(e => [e.date, e.isCompleted]));
        const mapB = new Map(entriesB.map(e => [e.date, e.isCompleted]));

        days.forEach(date => {
            const performedA = mapA.get(date) || false;
            const performedB = mapB.get(date) || false;

            if (performedA && performedB) a++;
            else if (performedA && !performedB) b++;
            else if (!performedA && performedB) c++;
            else d++;
        });

        return { a, b, c, d };
    }

    /**
     * Calculates the Phi coefficient (Mean Square Contingency Coefficient).
     * Formula: (ad - bc) / sqrt((a+b)(c+d)(a+c)(b+d))
     * Range: -1 (perfect negative correlation) to +1 (perfect positive correlation).
     * 
     * @returns The Phi coefficient or null if denominator is zero
     */
    private calculatePhi(a: number, b: number, c: number, d: number): number | null {
        const numerator = (a * d) - (b * c);
        const denominator = Math.sqrt((a + b) * (c + d) * (a + c) * (b + d));
        return denominator === 0 ? null : numerator / denominator;
    }

    /**
     * Calculates the Phi coefficient with Laplace smoothing.
     * Adds 1 to each cell (a,b,c,d) to prevent division by zero and handle sparse data better.
     * This provides a more conservative estimate for small sample sizes.
     * 
     * @returns The smoothed Phi coefficient
     */
    private calculateSmoothedPhi(a: number, b: number, c: number, d: number): number {
        // Reuse calculatePhi with smoothed values (Laplace smoothing: +1 to each cell)
        // We cast to number because with +1, denominator will never be 0 unless a=b=c=d=-1 which is impossible
        return this.calculatePhi(a + 1, b + 1, c + 1, d + 1) as number;
    }

    /**
     * Determines the confidence level of the correlation based on sample size and event frequency.
     * 
     * @param n - Total number of common days (sample size)
     * @param a - Count of both performed
     * @param b - Count of A performed, B not
     * @param c - Count of A not performed, B performed
     * @returns Confidence level string ('Very Low' | 'Low' | 'Medium' | 'High')
     */
    private calculateConfidence(n: number, a: number, b: number, c: number): 'Very Low' | 'Low' | 'Medium' | 'High' {
        // Simple heuristic based on sample size and frequency
        const countAOccurrences = a + b; // Total occurrences of A
        const countBOccurrences = a + c; // Total occurrences of B

        let confidence: 'Very Low' | 'Low' | 'Medium' | 'High';

        if (n < 10) {
            confidence = 'Very Low';
        } else if (n < 30) {
            confidence = 'Low';
        } else if (n < 60) {
            confidence = 'Medium';
        } else {
            confidence = 'High';
        }

        // Downgrade confidence if rare events (either habit occurred less than 3 times in common days)
        if (n >= 10 && (countAOccurrences < 3 || countBOccurrences < 3)) {
            if (confidence === 'High') {
                confidence = 'Medium';
            } else if (confidence === 'Medium') {
                confidence = 'Low';
            } else { // 'Low' or 'Very Low'
                confidence = 'Very Low';
            }
        }

        return confidence;
    }

    /**
     * Generates a human-readable summary string based on the Phi coefficient and confidence level.
     * 
     * @param phi - The smoothed Phi coefficient
     * @param confidence - The confidence level
     * @param nameA - Name of the first habit
     * @param nameB - Name of the second habit
     * @returns A descriptive string explaining the relationship
     */
    private generateSummary(phi: number, confidence: string, nameA: string, nameB: string): string {
        if (confidence === 'Very Low') {
            return `Not enough data to draw conclusions about ${nameA} and ${nameB}.`;
        }

        if (phi > 0.7) return `Strong positive link! You often do ${nameA} and ${nameB} together.`;
        if (phi > 0.3) return `Moderate link. ${nameA} and ${nameB} tend to happen on the same days.`;
        if (phi > -0.3) return `No significant pattern found between ${nameA} and ${nameB}.`;
        if (phi > -0.7) return `Moderate negative link. You rarely do ${nameA} and ${nameB} together.`;
        return `Strong negative link! ${nameA} and ${nameB} almost never happen on the same day.`;
    }

    /**
     * Returns a color string for the correlation badge based on the Phi value.
     * Green for positive correlation, Red for negative correlation.
     * Opacity scales with the strength of the correlation.
     * 
     * @param phi - The Phi coefficient (-1 to 1)
     * @returns RGBA color string
     */
    getCorrelationColor(phi: number): string {
        if (phi >= 0) {
            return `rgba(40, 167, 69, ${0.1 + (phi * 0.9)})`;
        } else {
            return `rgba(220, 53, 69, ${0.1 + (Math.abs(phi) * 0.9)})`;
        }
    }
}
