import { Component, type OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GitService } from './services/git/git.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  info?: { installed: boolean; version: string; };
  constructor(private gitService: GitService) { }
  ngOnInit(): void {
    this.gitService.getInfo().then(info => this.info = info);
  }
}
