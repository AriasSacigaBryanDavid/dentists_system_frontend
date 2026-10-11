import {
  Component,
  output,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { layouts } from '../../../../data/layout';
import { ILayout } from '../../../../interface/layout';
import { LayoutService } from '../../../../services/layout.service';

@Component({
  selector: 'app-layout-customizer',
  imports: [],
  templateUrl: './layout-customizer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './layout-customizer.scss',
})
export class LayoutCustomizer {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private layoutService = inject(LayoutService);

  readonly layoutOpen = output<boolean>();

  public layouts = layouts;
  public layout = localStorage.getItem('layout');
  constructor() {
    if (this.layout != null) {
      this.layoutService.applyLayout(this.layout);
    }
  }

  closeCustomizer() {
    this.layoutOpen.emit(false);
  }

  ngOnInit() {
    const savedLayout = localStorage.getItem('layout');

    if (savedLayout) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { layout: savedLayout },
        queryParamsHandling: 'merge',
      });
    }
  }

  applyLayout(layout: ILayout) {
    localStorage.setItem('layout', layout.slug);

    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { layout: layout.slug },
        queryParamsHandling: 'merge',
      })
      .then(() => {
        window.location.reload();
      });

    this.closeCustomizer();
  }
}
