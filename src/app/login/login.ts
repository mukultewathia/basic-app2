import { Component }       from '@angular/core';
import { AppDataService } from '../app_service_data';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { HttpClient }      from '@angular/common/http';
import { catchError }      from 'rxjs/operators';
import { lastValueFrom, of }              from 'rxjs';
import { Router } from '@angular/router';

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
  isError: boolean = false;
  // private readonly apiUrl = 'https://basic-app2-backend.onrender.com/login';
  //   private readonly allUsersUrl = 'https://basic-app2-backend.onrender.com/allUsers';
  private readonly apiUrl = 'http://localhost:8080/login';
  private readonly allUsersUrl = 'http://localhost:8080/allUsers';
  users: User[] = [];
  loggedIn: boolean = false;

  constructor(private readonly http: HttpClient, private readonly router: Router, private readonly appDataService: AppDataService) {
    console.log('login ctor');
    this.appDataService.reset();
  }

  private updateAfterLogin(username: string): void {
    this.appDataService.username = username;
    this.appDataService.loggedIn = true;
  }

  async onSubmit(form: { value: { username: string; password: string } }) {
    const { username, password } = form.value;
    
    // Reset message state
    this.message = null;
    this.isError = false;

    this.http
      .post(this.apiUrl,{ username, password } )
      .pipe(
        catchError(err => {
          console.error('Login error', err);
          this.message = 'Login failed. Please check your credentials.';
          this.isError = true;
          return of('');
        })
      )
      .subscribe(async response  => {
        if (response) {
          this.message = 'Login successful!';
          this.isError = false;
          this.loggedIn = true;
          await this.loadUsers();
          this.updateAfterLogin(username);
          this.router.navigate(['/weight']);
        } else {
          this.message = 'Login failed. Please try again.';
          this.isError = true;
        }
      });
  }

  async loadUsers(): Promise<void> {
   try {
    const data = await lastValueFrom(this.http.get<User[]>(this.allUsersUrl));
    this.users = data;
  } catch (err) {
    console.error('Failed to load users', err);
    // Re-throw the error if you want the calling function to know about it
    throw err;
  }
  }
}
