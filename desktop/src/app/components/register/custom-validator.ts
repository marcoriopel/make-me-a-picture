import { FormGroup, ValidatorFn, FormControl, FormGroupDirective, NgForm, AbstractControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/**
 * Source d'inspiration: https://stackoverflow.com/questions/47884655/display-custom-validator-error-with-mat-error
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
    name: 'Username invalid or already taken',
    password: 'Password must be between 7 and 15 characters, and contain at least one number and special character',
    confirmPassword: 'Passwords must match',
    usernameExist: 'Username already use'
};


/**
 * Check if user enter a forbidden name
 * @param control 
 */
export function forbiddenNameValidator(control: AbstractControl): {[key: string]: any} | null {
    const forbidden = /admin/.test(control.value);
    return forbidden ? { 'forbiddenName': {value:control.value}} : null;
}