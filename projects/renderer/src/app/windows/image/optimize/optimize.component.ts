import { Component, OnInit } from '@angular/core';
import type { ImageMap, OptimizeProgress } from '../../../../../../shared/services/image/image.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { DiffService } from '../../../services/diff/diff.service';
import { GitService } from '../../../services/git/git.service';
import { ImageService } from '../../../services/image/image.service';
import { WindowService } from '../../../services/window/window.service';


@Component({
  selector: 'app-optimize',
  standalone: false,

  templateUrl: './optimize.component.html',
  styleUrl: './optimize.component.scss'
})
export class OptimizeComponent implements OnInit {
  optimizing = true;
  progress: OptimizeProgress = {
    directory: '',
    directoryIndex: 0,
    totalDirectories: 0,
    file: '',
    fileIndex: 0,
    totalFiles: 0
  };
  done = false;
  dots = '';
  originalImageMap: ImageMap | undefined;
  optimizedImageMap: ImageMap | undefined;
  failedImages: string[] = [];

  constructor(
    private imageService: ImageService,
    private dialogService: DialogService,
    private gitService: GitService,
    private diffService: DiffService,
    private windowService: WindowService
  ) { }

  async ngOnInit() {
    this.imageService.onOptimizeProgress = (progress) => {
      this.optimizing = true;
      this.progress = progress;
    };
    this.imageService.onOptimizeFail = (file) => {
      this.failedImages.push(file);
    };
    setInterval(() => {
      if (this.dots.length > 2) {
        this.dots = '';
      } else {
        this.dots += '.';
      }
    }, 500);
    try {
      this.windowService.setClosable(false);
      const originalImageMap = await this.imageService.getImageMap();
      const optimizedImageMap = await this.imageService.optimizeImages(originalImageMap);
      await this.imageService.setImageMap(optimizedImageMap);
      await this.gitService.commitImages([''], ['Optimized Images', ...this.diffService.commitMsg(originalImageMap, optimizedImageMap)]);
      this.optimizing = false;
      this.done = true;
      this.windowService.setClosable(true);
    } catch (error) {
      this.optimizing = false;
      await this.dialogService.showMessageBox({ message: 'Failed To Optimize Images!', type: 'error', detail: (error as Error).message });
      await this.gitService.clean();
      this.windowService.close(undefined, true);
    }
  }
}
