import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@app/services/auth/auth.service';
import { User } from '@app/classes/user';
import { Router } from '@angular/router';
import { ACCESS } from '@app/classes/acces';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private snackBar: MatSnackBar){}

  async ngOnInit() {
    this.form = this.fb.group({
      username: ['', Validators.minLength(1)],
      password: ['', Validators.required]
    });
  }

  async onSubmit() {
    const user: User = {
      username: this.form.value.username,
      password: this.form.value.password
    }
    this.authService.login(user)
      .subscribe(
        res => {
          localStorage.setItem(ACCESS.TOKEN, res.token);
          localStorage.setItem(ACCESS.USERNAME, this.form.value.username);
          localStorage.setItem(ACCESS.AVATAR, res.avatar);
          localStorage.setItem('tutorial', '1');
          this.router.navigate(['/home']);
        },
        err => {
          if (err.error == "Not Found")
            this.form.get('password')?.setErrors({'notValid': true});
          else if (err.error == 'Already logged in')
            this.snackBar.open("Vous êtes déjà connecté!", "", {
              duration: 2000,
            });
        }
      )
    
  }
}
