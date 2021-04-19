import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor() {
        if(localStorage.getItem('isExternalWindow') != 'true'){
            localStorage.clear();
        }
        const func = (e: MouseEvent) => {
            e.preventDefault();
        };
        document.addEventListener('contextmenu', func, false);
    }
}
