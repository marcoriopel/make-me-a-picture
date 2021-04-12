import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { ChatBarComponent } from './components/chat-bar/chat-bar.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { GridComponent } from './components/grid/grid.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AvatarComponent } from './components/avatar/avatar.component'
import { AuthService } from './services/auth/auth.service';
import { AuthGuard } from './auth.guard';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AvatarIconComponent } from './components/avatar-icon/avatar-icon.component';
import { ChatComponent } from './components/chat/chat.component';
import { NgxElectronModule } from 'ngx-electron';
import { ChatService } from './services/chat/chat.service';
import { ImageCreationComponent } from './components/image-creation/image-creation.component';
import { GameBarComponent } from './components/game-bar/game-bar.component';
import { SearchGameService } from './services/search-game/search-game.service';
import { GameSearchComponent } from './components/game-search/game-search.component';
import { ViewingComponent } from './components/viewing/viewing.component';
import { GamePreviewComponent } from './components/game-preview/game-preview.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { LobbyService } from './services/lobby/lobby.service';
import { GameCreationComponent } from './components/game-creation/game-creation.component'
import { SocketService } from './services/socket/socket.service';
import { ToolsComponent } from './components/tools/tools.component';
import { RoundTransitionComponent } from './components/round-transition/round-transition.component';
import { ClassicGameComponent } from './components/classic-game/classic-game.component';
import { SprintGameComponent } from './components/sprint-game/sprint-game.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { MatMenuModule } from '@angular/material/menu';
import { DrawingSuggestionsComponent } from './components/drawing-suggestions/drawing-suggestions.component';
import { EndGameDrawingComponent } from './components/end-game-drawing/end-game-drawing.component';
import { TutorialComponent } from './components/tutorial/tutorial.component';
import { MatStepperModule } from '@angular/material/stepper';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { JoinPrivateGameComponent } from './components/join-private-game/join-private-game.component';
import { FeedComponent } from './components/feed/feed.component';

@NgModule({
    declarations: [
        AppComponent,
        GridComponent,
        EditorComponent,
        DrawingComponent,
        MainPageComponent,
        ChatBarComponent,
        LoginComponent,
        RegisterComponent,
        AvatarComponent,
        NavbarComponent,
        ChatComponent,
        ImageCreationComponent,
        AvatarIconComponent,
        ChatComponent,
        GameBarComponent,
        GameSearchComponent,
        ViewingComponent,
        GamePreviewComponent,
        LobbyComponent,
        GameCreationComponent,
        ToolsComponent,
        RoundTransitionComponent,
        ClassicGameComponent,
        SprintGameComponent,
        ProfileComponent,
        LeaderboardComponent,
        DrawingSuggestionsComponent,
        EndGameDrawingComponent,
        TutorialComponent,
        JoinPrivateGameComponent,
        FeedComponent,
    ],
    imports: [
        BrowserModule,
        MatCardModule,
        NoopAnimationsModule,
        HttpClientModule,
        ReactiveFormsModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatDialogModule,
        MatChipsModule,
        MatTabsModule,
        MatSliderModule,
        MatSnackBarModule,
        MatRadioModule,
        MatTooltipModule,
        MatIconModule,
        MatButtonToggleModule,
        MatProgressSpinnerModule,
        MatExpansionModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        MatInputModule,
        MatToolbarModule,
        NgxElectronModule,
        MatMenuModule,
        BrowserAnimationsModule,
        MatStepperModule,
    ],
    entryComponents: [MainPageComponent],
    providers: [AuthService, AuthGuard, ChatService, SearchGameService, LobbyService, SocketService,
    {
        provide: STEPPER_GLOBAL_OPTIONS,
        useValue: { displayDefaultIndicatorType: false }
    }],
    bootstrap: [AppComponent],
})
export class AppModule { }
