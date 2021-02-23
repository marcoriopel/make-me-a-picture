import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@app/services/auth/auth.service';
import { User } from '@app/classes/user';
import { Router } from '@angular/router';
import { CustomValidators, ConfirmValidParentMatcher, errorMessages, forbiddenNameValidator } from './custom-validator';

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
      }, { validator: CustomValidators.childrenEqual})
    });
  }

  logValue() {
    console.log(this.userRegistrationForm.value.avatar);
  }

  async register() { 
    const user: User = {
      username: this.userRegistrationForm.value.username,
      password: this.userRegistrationForm.value.passwordGroup.password
    }
    this.authService.register(user).subscribe(
      res => {
        localStorage.setItem('token', res.token);
        console.log('res: ' + res);
        this.router.navigate(['/home']);
        // set information
      },
      err => {
        console.log(err);
        this.userRegistrationForm.get('username')?.setErrors({'forbiddenName': true});
      }
    )
  }

}
