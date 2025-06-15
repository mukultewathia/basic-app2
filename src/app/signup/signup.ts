import { Component } from '@angular/core';
import { FormsModule }       from '@angular/forms';
import { CommonModule }       from '@angular/common';
import { HttpClient }       from '@angular/common/http';
import { catchError }       from 'rxjs/operators';
import { of }               from 'rxjs';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class Signup {
  message: string | null = null;
  private readonly apiUrl = 'http://localhost:8080/signup';

  constructor(private http: HttpClient) {}

   onSubmit(form: { value: { username: string; password: string } }) {
      const payload = {
        username: form.value.username,
        password: form.value.password
      };

      this.http
      .post(this.apiUrl, payload, { responseType: 'text' })
      .pipe(
        catchError(err => {
          console.error('Signup error', err);
          this.message = 'Signup failed. Is the backend running?';
          return of('');       // emit an empty string so subscribe still fires
        })
      )
      .subscribe(responseText => {
        if (responseText) {
          this.message = responseText;
        } else {
          this.message = this.message || 'Signup failed.';
        }
      });

    }
}
