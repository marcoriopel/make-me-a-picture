import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorComponent } from './components/editor/editor.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from '@app/auth.guard';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full', canActivate: [AuthGuard] },
    { path: 'home', component: MainPageComponent, canActivate: [AuthGuard] },
    { path: 'editor', component: EditorComponent, canActivate: [AuthGuard] },
    { path: 'login' , component: LoginComponent },
    { path: '**', redirectTo: '/home', canActivate: [AuthGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
