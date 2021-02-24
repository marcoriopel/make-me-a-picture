import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@app/services/auth/auth.service';
import { NewUser } from '@app/classes/user';
import { Router } from '@angular/router';
import { CustomValidators, ConfirmValidParentMatcher, errorMessages, forbiddenNameValidator } from './custom-validator';
import { ChatService } from '@app/services/chat/chat.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  userRegistrationForm: FormGroup;
  confirmValidParentMatcher = new ConfirmValidParentMatcher();
  errors = errorMessages;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private chatService: ChatService) { }

  ngOnInit(): void {
    this.userRegistrationForm = this.fb.group({
      firstname: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(128)
      ]],
      name: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(128)
      ]],
      avatar: ['', [
        Validators.required,
      ]],
        username: ['', [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(128),
          forbiddenNameValidator
      ]],
      passwordGroup: this.fb.group({
        password: ['', [
          Validators.required
          // Validators.pattern(regExps.password)
        ]],
        confirmPassword: ['', Validators.required]
      }, { validator: CustomValidators.childrenEqual })
    });
  }

  async register() {
    const user: NewUser = {
      username: this.userRegistrationForm.value.username,
      password: this.userRegistrationForm.value.passwordGroup.password,
      surname: this.userRegistrationForm.value.name,
      name: this.userRegistrationForm.value.firstname,
      avatar: this.userRegistrationForm.value.avatar
    }
    this.authService.register(user).subscribe(
      res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', this.userRegistrationForm.value.username);
        console.log('res: ' + res);
        this.router.navigate(['/home']);
        this.chatService.connect();
      },
      err => {
        console.log(err);
        this.userRegistrationForm.get('username')?.setErrors({ 'forbiddenName': true });
      }
    )
  }

}
