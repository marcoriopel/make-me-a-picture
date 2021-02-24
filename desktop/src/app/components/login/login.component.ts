import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@app/services/auth/auth.service';
import { User } from '@app/classes/user';
import { Router } from '@angular/router';
import { ChatService } from '@app/services/chat/chat.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private chatService: ChatService){}

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
          console.log(res);
          this.router.navigate(['/home']);
          this.chatService.connect();
        },
        err => {
          if (err.error == "Not Found")
            this.form.get('password')?.setErrors({'notValid': true});
          else
            console.log(err.error);
        }
      )
    
  }
}
