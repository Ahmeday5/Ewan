import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { LoaderService } from './shared/components/loader/services/loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent,CommonModule, NgIf, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Ewan';

  isLoading$: Observable<boolean>;

  constructor(private loader: LoaderService) {
    this.isLoading$ = this.loader.loading$;
  }
}
