import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Bug, Lightbulb, MessageSquare, Star, Send, Image as ImageIcon,
  CheckCircle2, ChevronRight, ChevronLeft, BarChart2, X, Paperclip
} from 'lucide-angular';
import { ModalService } from '../modal/modalService';

export type FeedbackTab = 'rating' | 'feature' | 'bug' | 'contact' | 'nps';

export interface RatingForm {
  score: number;
  mood: string;
  aspects: string[];
  comment: string;
}

export interface FeatureForm {
  title: string;
  problem: string;
  useCase: string;
  priority: 'low' | 'medium' | 'high';
  teamSize: string;
}

export interface BugForm {
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  steps: string;
  browser: string;
  frequency: string;
  attachmentName: string;
}

export interface ContactForm {
  topic: string;
  subject: string;
  message: string;
  replyMethod: string;
}

export interface NpsForm {
  score: number | null;
  reasons: string[];
  comment: string;
}

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './feedback.component.html',
})
export class FeedbackComponent implements OnInit {

  @Output() feedbackSubmitted = new EventEmitter<any>();
  @Input() feedbackType: FeedbackTab = 'rating';

  // Lucide icons
  Bug = Bug;
  Lightbulb = Lightbulb;
  MessageSquare = MessageSquare;
  StarIcon = Star;
  Send = Send;
  ImageIcon = ImageIcon;
  CheckCircle2 = CheckCircle2;
  ChevronRight = ChevronRight;
  ChevronLeft = ChevronLeft;
  BarChart2 = BarChart2;
  X = X;
  Paperclip = Paperclip;

  // Tab state
  activeTab: FeedbackTab = 'rating';
  isSubmitted = false;
  isSubmitting = false;

  // Rating
  hoverStar = 0;
  starLabels = ['', 'Terrible 😣', 'Poor 😕', 'Okay 🙂', 'Good 😊', 'Excellent 🤩'];
  aspectOptions = ['Performance', 'Design', 'Support', 'Reliability', 'Onboarding', 'Documentation'];
  moodOptions = [
    { label: 'Frustrated', emoji: '😤', value: 'frustrated' },
    { label: 'Neutral', emoji: '😐', value: 'neutral' },
    { label: 'Satisfied', emoji: '🙂', value: 'satisfied' },
    { label: 'Delighted', emoji: '🤩', value: 'delighted' },
  ];

  ratingForm: RatingForm = { score: 0, mood: '', aspects: [], comment: '' };

  // Feature
  featureForm: FeatureForm = { title: '', problem: '', useCase: '', priority: 'medium', teamSize: '' };
  teamSizeOptions = ['Just me', '2–5', '6–20', '20+'];
  priorityOptions = [
    { label: 'Nice to have', value: 'low' },
    { label: 'Important', value: 'medium' },
    { label: 'Critical', value: 'high' },
  ];

  // Bug
  bugStep = 1;
  severityOptions = [
    { label: '🟢 Low', value: 'low', hint: 'Minor visual issue — doesn\'t affect functionality.' },
    { label: '🟡 Medium', value: 'medium', hint: 'Functional but annoying — you can work around it.' },
    { label: '🟠 High', value: 'high', hint: 'Feature is broken — significantly impacts your workflow.' },
    { label: '🔴 Critical', value: 'critical', hint: 'Completely blocking — cannot use the product.' },
  ];
  browserOptions = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Mobile app (iOS)', 'Mobile app (Android)', 'Other'];
  frequencyOptions = [
    { label: 'Always happens', value: 'always' },
    { label: 'Often (~50%)', value: 'often' },
    { label: 'Sometimes', value: 'sometimes' },
    { label: 'Only happened once', value: 'once' },
  ];
  bugForm: BugForm = { title: '', severity: 'medium', description: '', steps: '', browser: '', frequency: '', attachmentName: '' };

  constructor(private modalService: ModalService) {
    //this.setTab(this.feedbackType);
  }
  ngOnInit(): void {
    this.setTab(this.feedbackType);
  }

  get currentSeverityHint(): string {
    return this.severityOptions.find(s => s.value === this.bugForm.severity)?.hint ?? '';
  }

  // Contact
  topicOptions = ['Billing', 'Account', 'Technical', 'Partnership', 'Other'];
  replyOptions = [
    { label: '✉️ Email', value: 'email' },
    { label: '💬 In-app', value: 'inapp' },
    { label: 'No reply needed', value: 'none' },
  ];
  contactForm: ContactForm = { topic: '', subject: '', message: '', replyMethod: '' };

  // NPS
  npsScores = Array.from({ length: 11 }, (_, i) => i);
  npsForm: NpsForm = { score: null, reasons: [], comment: '' };

  get npsChips(): string[] {
    const s = this.npsForm.score;
    if (s === null) return [];
    if (s >= 9) return ['Easy to use', 'Great features', 'Saves me time', 'Excellent support', 'Good value'];
    if (s >= 7) return ['Generally good', 'A few rough edges', 'Could be simpler', 'Need more features'];
    return ['Too expensive', 'Missing features', 'Hard to learn', 'Slow performance', 'Poor support'];
  }

  get npsFollowupLabel(): string {
    const s = this.npsForm.score;
    if (s === null) return '';
    if (s >= 9) return 'What do you love most?';
    if (s >= 7) return 'What would make it a 10?';
    return 'What disappointed you?';
  }

  get npsScoreColor(): string {
    const s = this.npsForm.score;
    if (s === null) return '';
    if (s >= 9) return 'bg-emerald-500';
    if (s >= 7) return 'bg-amber-400';
    return 'bg-rose-500';
  }

  // Tabs
  tabs: { id: FeedbackTab; label: string; emoji: string }[] = [
    { id: 'rating', label: 'Rate', emoji: '⭐' },
    { id: 'feature', label: 'Feature', emoji: '💡' },
    { id: 'bug', label: 'Bug', emoji: '🐛' },
    { id: 'contact', label: 'Contact', emoji: '✉️' },
    { id: 'nps', label: 'NPS', emoji: '📊' },
  ];

  setTab(tab: FeedbackTab) {
    this.activeTab = tab;
    this.isSubmitted = false;
    this.bugStep = 1;
  }

  // Rating
  setRating(score: number) { this.ratingForm.score = score; }

  toggleAspect(aspect: string) {
    const idx = this.ratingForm.aspects.indexOf(aspect);
    if (idx > -1) this.ratingForm.aspects.splice(idx, 1);
    else this.ratingForm.aspects.push(aspect);
  }

  isAspectSelected(aspect: string) { return this.ratingForm.aspects.includes(aspect); }

  get starLabel(): string { return this.starLabels[this.hoverStar || this.ratingForm.score] || 'Click a star to rate'; }
  get canSubmitRating() { return this.ratingForm.score > 0; }

  // Feature
  get canSubmitFeature() { return !!this.featureForm.title.trim() && !!this.featureForm.problem.trim(); }

  // Bug
  get canAdvanceBug() { return !!this.bugForm.title.trim() && !!this.bugForm.description.trim(); }

  fakeAttachment(event: Event) {
    event.preventDefault();
    this.bugForm.attachmentName = 'screenshot.png';
  }

  // Contact
  get canSubmitContact() { return !!this.contactForm.subject.trim() && !!this.contactForm.message.trim(); }

  // NPS
  setNps(score: number) {
    this.npsForm.score = score;
    this.npsForm.reasons = [];
  }

  toggleNpsReason(reason: string) {
    const idx = this.npsForm.reasons.indexOf(reason);
    if (idx > -1) this.npsForm.reasons.splice(idx, 1);
    else this.npsForm.reasons.push(reason);
  }

  isNpsReasonSelected(r: string) { return this.npsForm.reasons.includes(r); }

  getNpsButtonClass(score: number): string {
    const base = 'w-9 h-9 rounded-lg border text-sm font-medium transition-all duration-150 ';
    if (this.npsForm.score === score) {
      if (score >= 9) return base + 'bg-emerald-500 border-emerald-500 text-white';
      if (score >= 7) return base + 'bg-amber-400 border-amber-400 text-white';
      return base + 'bg-rose-500 border-rose-500 text-white';
    }
    return base + 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-400 hover:text-indigo-600';
  }

  // Submit
  submitFeedback() {
    this.isSubmitting = true;
    const payload = this.buildPayload();
    setTimeout(() => {
      this.feedbackSubmitted.emit(payload);
      this.isSubmitting = false;
      this.isSubmitted = true;
    }, 700);
  }

  private buildPayload() {
    switch (this.activeTab) {
      case 'rating': return { type: 'rating', ...this.ratingForm };
      case 'feature': return { type: 'feature', ...this.featureForm };
      case 'bug': return { type: 'bug', ...this.bugForm };
      case 'contact': return { type: 'contact', ...this.contactForm };
      case 'nps': return { type: 'nps', ...this.npsForm };
    }
  }

  resetForms() {
    this.isSubmitted = false;
    this.bugStep = 1;
    this.hoverStar = 0;
    this.ratingForm = { score: 0, mood: '', aspects: [], comment: '' };
    this.featureForm = { title: '', problem: '', useCase: '', priority: 'medium', teamSize: '' };
    this.bugForm = { title: '', severity: 'medium', description: '', steps: '', browser: '', frequency: '', attachmentName: '' };
    this.contactForm = { topic: '', subject: '', message: '', replyMethod: '' };
    this.npsForm = { score: null, reasons: [], comment: '' };
  }
}