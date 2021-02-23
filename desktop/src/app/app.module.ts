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
import { AttributePanelComponent } from './components/attribute-panel/attribute-panel.component';
import { ChatBarComponent } from './components/chat-bar/chat-bar.component';
import { ColorPickerComponent } from './components/color-picker/color-picker.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { GridComponent } from './components/grid/grid.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { EraserAttributesComponent } from './components/tools/eraser-attributes/eraser-attributes.component';
import { SliderComponent } from './components/tools/shared-Attributes/slider/slider.component';
import { PencilAttributesComponent } from './components/tools/pencil-attributes/pencil-attributes.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AvatarComponent } from './components/avatar/avatar.component'
import { AuthService } from './services/auth/auth.service';
import { AuthGuard } from './auth.guard';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AvatarIconComponent } from './components/avatar-icon/avatar-icon.component';
@NgModule({
    declarations: [
        AppComponent,
        GridComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        AttributePanelComponent,
        EraserAttributesComponent,
        PencilAttributesComponent,
        ChatBarComponent,
        SliderComponent,
        ColorPickerComponent,
        LoginComponent,
        RegisterComponent,
        AvatarComponent,
        NavbarComponent,
        AvatarIconComponent
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
    ],
    entryComponents: [MainPageComponent],
    providers: [AuthService, AuthGuard,],
    bootstrap: [AppComponent],
})
export class AppModule { }
