import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@app/services/auth/auth.service';
import { NewUser } from '@app/classes/user';
import { Router } from '@angular/router';
import { CustomValidators, ConfirmValidParentMatcher, errorMessages, forbiddenNameValidator } from './custom-validator';
import { ACCESS } from '@app/classes/acces';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  userRegistrationForm: FormGroup;
  confirmValidParentMatcher = new ConfirmValidParentMatcher();
  errors = errorMessages;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.userRegistrationForm = this.fb.group({
      firstname: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(16)
      ]],
      name: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(16)
      ]],
      avatar: ['0', [
        Validators.required,
      ]],
        username: ['', [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(16),
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
        localStorage.setItem(ACCESS.TOKEN, res.token);
        localStorage.setItem(ACCESS.USERNAME, this.userRegistrationForm.value.username);
        localStorage.setItem(ACCESS.AVATAR, res.avatar);
        localStorage.setItem('tutorial', '0');
        this.router.navigate(['/home']);
      },
      err => {
        console.log(err);
        this.userRegistrationForm.get('username')?.setErrors({ 'forbiddenName': true });
      }
    )
  }

}
