import { Component, ViewEncapsulation } from '@angular/core';
import { ConfigService } from '../../../services/config/config.service';
import { WindowService } from '../../../services/window/window.service';
import { SuggestionService } from '../../../services/suggestion/suggestion.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent {
  constructor(private windowService: WindowService, public configService: ConfigService, public suggestionService: SuggestionService) { }

  async openSetup() {
    await this.windowService.openSetup();
    await this.windowService.close();
  }
}
