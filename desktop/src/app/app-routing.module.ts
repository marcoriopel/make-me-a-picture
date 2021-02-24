import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorComponent } from './components/editor/editor.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from '@app/auth.guard';
import { ChatBarComponent } from './components/chat-bar/chat-bar.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full', canActivate: [AuthGuard] },
    { path: 'chat', component: ChatBarComponent, canActivate: [AuthGuard] },
    { path: 'home', component: MainPageComponent, canActivate: [AuthGuard] },
    { path: 'editor', component: EditorComponent, canActivate: [AuthGuard] },
    { path: 'login' , component: LoginComponent },
    { path: 'register' , component: RegisterComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule],
})
export class AppRoutingModule {}
