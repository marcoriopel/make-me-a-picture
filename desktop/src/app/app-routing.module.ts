import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorComponent } from './components/editor/editor.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from '@app/auth.guard';
import { ChatBarComponent } from './components/chat-bar/chat-bar.component';
import { ImageCreationComponent } from './components/image-creation/image-creation.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { ClassicGameComponent } from './components/classic-game/classic-game.component';
import { SprintGameComponent } from './components/sprint-game/sprint-game.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { TutorialComponent } from './components/tutorial/tutorial.component';
import { TutorialGuard } from './tutorial.guard';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full', canActivate: [AuthGuard] },
    { path: 'chat', component: ChatBarComponent, canActivate: [AuthGuard, TutorialGuard] },
    { path: 'home', component: MainPageComponent, canActivate: [AuthGuard, TutorialGuard] },
    { path: 'editor', component: EditorComponent, canActivate: [AuthGuard, TutorialGuard] },
    { path: 'lobby', component: LobbyComponent, canActivate: [AuthGuard, TutorialGuard] },
    { path: 'game/classic', component : ClassicGameComponent, canActivate: [AuthGuard, TutorialGuard] },
    { path: 'game/sprint', component : SprintGameComponent, canActivate: [AuthGuard, TutorialGuard] },
    { path: 'login' , component: LoginComponent },
    { path: 'register' , component: RegisterComponent },
    { path: 'image', component: ImageCreationComponent, canActivate: [AuthGuard, TutorialGuard]},
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard, TutorialGuard]},
    { path: 'leaderboard', component: LeaderboardComponent, canActivate: [AuthGuard, TutorialGuard]},
    { path: 'tutorial', component: TutorialComponent, canActivate: [AuthGuard]},
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule],
})
export class AppRoutingModule {}
