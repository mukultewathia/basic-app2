import { Component }       from '@angular/core';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { HttpClient }      from '@angular/common/http';
import { catchError }      from 'rxjs/operators';
import { of }              from 'rxjs';

interface User {
  username: string;
  password: string;
}


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls:   ['./login.scss']
})
export class LoginComponent {
  message: string | null = null;
  private readonly apiUrl = 'https://basic-app2-backend.onrender.com/login';
  private readonly allUsersUrl = 'https://basic-app2-backend.onrender.com/allUsers';
  users: User[] = [];
  loggedIn: boolean = false;

  constructor(private http: HttpClient) {
    console.log('login ctor');
  }

  async onSubmit(form: { value: { username: string; password: string } }) {
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
      .subscribe(async response  => {
        if (response) {
          this.message = 'success';
          this.loggedIn = true;
          await this.loadUsers();
        } else {
          this.message = this.message || 'Login failed.';
        }
      });
  }

  async loadUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<User[]>(this.allUsersUrl).subscribe({
        next: (data) => {
          this.users = data;
          resolve();
        },
        error: (err) => {
          console.error('Failed to load users', err);
          reject(err);
        }
      });
    });
  }
}
