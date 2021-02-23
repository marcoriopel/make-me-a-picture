import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@app/services/auth/auth.service';
import { User } from '@app/classes/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router){}

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
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', this.form.value.username);
          localStorage.setItem('avatar', res.avatar);
          console.log(res);
          this.router.navigate(['/home']);
        },
        err => {
          if (err.error == "Unauthorized")
            this.form.get('password')?.setErrors({'notValid': true});
        }
      )
    
  }
}
