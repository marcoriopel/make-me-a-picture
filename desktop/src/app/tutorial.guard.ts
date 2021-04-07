import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TutorialGuard implements CanActivate {

  constructor(private router: Router){}
  
  canActivate(): boolean {
    if(localStorage.getItem('tutorial') == '1') {
      return true
    } else {
      this.router.navigate(['/tutorial']);
      return false
    }
  }
  
}
