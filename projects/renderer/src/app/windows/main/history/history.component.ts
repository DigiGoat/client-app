import { Component, type OnInit } from '@angular/core';
import type { History } from '../../../../../../shared/services/git/git.service';
import { GitService } from '../../../services/git/git.service';
import { MarkedService } from '../../../services/marked/marked.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  constructor(private gitService: GitService, public marked: MarkedService) { }
  history?: History;
  async ngOnInit() {
    this.history = await this.gitService.getHistory();
  }
  formatBody(body: string) {
    body = body.replace(/"([^"]*)"/g, (match, p1) => `<span class="unsaved">"${this.marked.parseInline(p1.replaceAll('\\n', '\n'))}"</span>`);
    return body;
  }
}
