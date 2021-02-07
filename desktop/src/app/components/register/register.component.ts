import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { AuthService } from '@app/services/auth/auth.service';
import { NewUser } from '@app/classes/user';
import { ErrorStateMatcher } from '@angular/material/core';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  userRegistrationForm: FormGroup;
  confirmValidParentMatcher = new ConfirmValidParentMatcher();
  errors = errorMessages;

  constructor(private fb: FormBuilder, private authService: AuthService) { }

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
        username: ['', [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(128)
      ]],
        passwordGroup: this.fb.group({
          password: ['', [
              Validators.required,
              Validators.pattern(regExps.password)
          ]],
          confirmPassword: ['', Validators.required]
      }, { validator: CustomValidators.childrenEqual})
    });
  }

  async register() {
    const user: NewUser = {
      firstname: this.userRegistrationForm.value.firstname,
      name: this.userRegistrationForm.value.name,
      username: this.userRegistrationForm.value.username,
      password: this.userRegistrationForm.value.password,
      avatar: null
    }
    this.authService.register(user)
  }

}

/**
 * Source: https://stackoverflow.com/questions/47884655/display-custom-validator-error-with-mat-error
 */

/**
 * Custom validator functions for reactive form validation
 */
export class CustomValidators {
    /**
     * Validates that child controls in the form group are equal
     */
    static childrenEqual: ValidatorFn = (formGroup: FormGroup) => {
        const [firstControlName, ...otherControlNames] = Object.keys(formGroup.controls || {});
        const isValid = otherControlNames.every(controlName => formGroup.get(controlName)!.value === formGroup.get(firstControlName)!.value);
        return isValid ? null : { childrenNotEqual: true };
        
    }
}

/**
 * Custom ErrorStateMatcher which returns true (error exists) when the parent form group is invalid and the control has been touched
 */
export class ConfirmValidParentMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
      return control!.parent.invalid && control!.touched;
  }
}

/**
 * Collection of reusable RegExps
 */
export const regExps: { [key: string]: RegExp } = {
    password: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/
};

/**
 * Collection of reusable error messages
 */
export const errorMessages: { [key: string]: string } = {
    name: 'Name must be between 1 and 128 characters',
    password: 'Password must be between 7 and 15 characters, and contain at least one number and special character',
    confirmPassword: 'Passwords must match'
};