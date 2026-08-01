import { ChangeDetectionStrategy, Component, inject, signal, type OnInit, type WritableSignal } from '@angular/core';
import type { History } from '../../../../../../shared/services/git/git.service';
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

  history: WritableSignal<History | undefined> = signal(undefined);
  async ngOnInit() {
    this.history.set(await this.gitService.getHistory());

    this.gitService.onchange = async () => this.history.set(await this.gitService.getHistory());
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
