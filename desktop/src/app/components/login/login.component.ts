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
          console.log(res);
          this.router.navigate(['/home']);
        },
        err => {
          console.log(err)
          alert("Mauvais nom d'utilisateur ou mot de passe")
          this.form.get('username')?.setErrors({'notValid': true});
          this.form.get('password')?.setErrors({'notValid': true});
        }
      )
    
  }
}
