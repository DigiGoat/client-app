import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import type { LogResult } from 'simple-git';
import { GitService } from '../../../services/git/git.service';
import { MarkedService } from '../../../services/marked/marked.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class HistoryComponent implements OnInit {
  private gitService = inject(GitService);
  marked = inject(MarkedService);

  localHistory = signal<LogResult | undefined>(undefined);
  remoteHistory = signal<LogResult | undefined>(undefined);
  async ngOnInit() {
    this.gitService.getLocalHistory().then(history => this.localHistory.set(history));
    this.gitService.getCloudHistory().then(history => this.remoteHistory.set(history));
    this.gitService.onchange = async () => {
      this.gitService.getLocalHistory().then(history => this.localHistory.set(history));
      this.gitService.getCloudHistory().then(history => this.remoteHistory.set(history));
    };
  }
  formatBody(body: string) {
    body = body.replace(/"([^"]*)"/g, (match, p1) => `<span class="unsaved">"${this.marked.parseInline(p1.replaceAll('\\n', '\n'))}"</span>`);
    body = body.replace(/\b(\d+(\.\d+)?)\b/g, (match) => `<span class="text-info-emphasis">${match}</span>`);
    body = body.replace(/\b(true|false)\b/g, (match) => `<span class="text-danger-emphasis">${match}</span>`);
    return body;
  }

  briefBodyFormat(body: string) {
    body = body.replace(/"([^"]*)"/g, (match, p1) => `<span class="unsaved">"${p1.replaceAll('\\n', '\n')}"</span>`);
    body = body.replace(/\b(\d+(\.\d+)?)\b/g, (match) => `<span class="text-info-emphasis">${match}</span>`);
    body = body.replace(/\b(true|false)\b/g, (match) => `<span class="text-danger-emphasis">${match}</span>`);
    return body;

  }
}
