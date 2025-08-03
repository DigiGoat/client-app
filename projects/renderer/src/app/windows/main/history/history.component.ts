import { Component, type OnInit } from '@angular/core';
import type { History } from '../../../../../../shared/services/git/git.service';
import { GitService } from '../../../services/git/git.service';
import { MarkedService } from '../../../services/marked/marked.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  standalone: false
})
export class HistoryComponent implements OnInit {
  constructor(private gitService: GitService, public marked: MarkedService) { }
  history?: History;
  async ngOnInit() {
    this.history = await this.gitService.getHistory();

    this.gitService.onchange = async () => this.history = await this.gitService.getHistory();
  }
  formatBody(body: string) {
    body = body.replace(/"([^"]*)"/g, (match, p1) => `<span class="unsaved">"${this.marked.parseInline(p1.replaceAll('\\n', '\n'))}"</span>`);
    body = body.replace(/\b(\d+(\.\d+)?)\b/g, (match) => `<span class="text-info-emphasis">${match}</span>`);
    body = body.replace(/\b(true|false)\b/g, (match) => `<span class="text-danger-emphasis">${match}</span>`);
    return body;
  }
}
