import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss']
})
export class TutorialComponent implements OnInit {
  isEditable = false;
  
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  quit(): void {
    localStorage.setItem('tutorial', '1');
    this.router.navigate(['/home']);
  }

}
