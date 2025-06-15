import { Component }       from '@angular/core';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { HttpClient }      from '@angular/common/http';
import { catchError }      from 'rxjs/operators';
import { of }              from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls:   ['./login.scss']
})
export class LoginComponent {
  message: string | null = null;
  private readonly apiUrl = 'http://localhost:8080/login';

  constructor(private http: HttpClient) {}

  onSubmit(form: { value: { username: string; password: string } }) {
    const { username, password } = form.value;

    this.http
      .post(this.apiUrl,{ username, password } )
      .pipe(
        catchError(err => {
          console.error('Login error', err);
          this.message = 'Login failed. Is the backend running?';
          return of('');
        })
      )
      .subscribe(response => {
        if (response) {
          // e.g. "Login successful" or error message from server
          this.message = 'success';
        } else {
          // empty string means an error was caught
          this.message = this.message || 'Login failed.';
        }
      });
  }
}
