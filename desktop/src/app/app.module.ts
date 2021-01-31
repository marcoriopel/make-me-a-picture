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
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { AttributePanelComponent } from './components/attribute-panel/attribute-panel.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { ColorPickerComponent } from './components/color-picker/color-picker.component';
import { DrawingDetailComponent } from './components/drawing-detail/drawing-detail.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { ExportComponent } from './components/export/export.component';
import { GeneralDetailComponent } from './components/general-detail/general-detail.component';
import { GridComponent } from './components/grid/grid.component';
import { LoadSelectedDrawingAlertComponent } from './components/load-selected-drawing-alert/load-selected-drawing-alert.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { NewDrawingModalComponent } from './components/new-drawing-modal/new-drawing-modal.component';
import { SavingComponent } from './components/saving/saving.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { BrushAttributesComponent } from './components/tools/brush-attributes/brush-attributes.component';
import { CircleAttributesComponent } from './components/tools/circle-attributes/circle-attributes.component';
import { CircleSelectionAttributesComponent } from './components/tools/circle-selection-attributes/circle-selection-attributes.component';
import { EraserAttributesComponent } from './components/tools/eraser-attributes/eraser-attributes.component';
import { FillAttributesComponent } from './components/tools/fill-attributes/fill-attributes.component';
import { LineAttributesComponent } from './components/tools/line-attributes/line-attributes.component';
import { MagicWandAttributesComponent } from './components/tools/magic-wand-attributes/magic-wand-attributes.component';
import { PenAttributesComponent } from './components/tools/pen-attributes/pen-attributes.component';
import { PencilAttributesComponent } from './components/tools/pencil-attributes/pencil-attributes.component';
import { PipetteAttributesComponent } from './components/tools/pipette-attributes/pipette-attributes.component';
import { PolygoneAttributesComponent } from './components/tools/polygone-attributes/polygone-attributes.component';
import { MagnetismComponent } from './components/tools/shared-Attributes/magnetism/magnetism.component';
import { SliderComponent } from './components/tools/shared-Attributes/slider/slider.component';
import { TypeOfFillSelectionComponent } from './components/tools/shared-Attributes/type-of-fill-selection/type-of-fill-selection.component';
import { SprayAttributesComponent } from './components/tools/spray-attributes/spray-attributes.component';
import { SquareAttributesComponent } from './components/tools/square-attributes/square-attributes.component';
import { SquareSelectionAttributesComponent } from './components/tools/square-selection-attributes/square-selection-attributes.component';
import { StampAttributesComponent } from './components/tools/stamp-attributes/stamp-attributes.component';
import { TextComponent } from './components/tools/text-attributes/text-attributes.component';
import { UserGuideComponent } from './components/userguide/user-guide.component';

@NgModule({
    declarations: [
        AppComponent,
        GridComponent,
        EditorComponent,
        SidebarComponent,
        MagicWandAttributesComponent,
        DrawingComponent,
        MainPageComponent,
        UserGuideComponent,
        LoadSelectedDrawingAlertComponent,
        UserGuideComponent,
        DrawingDetailComponent,
        GeneralDetailComponent,
        AttributePanelComponent,
        BrushAttributesComponent,
        CircleAttributesComponent,
        EraserAttributesComponent,
        LineAttributesComponent,
        PencilAttributesComponent,
        SliderComponent,
        SquareAttributesComponent,
        NewDrawingModalComponent,
        ColorPickerComponent,
        TypeOfFillSelectionComponent,
        PipetteAttributesComponent,
        FillAttributesComponent,
        SavingComponent,
        CarouselComponent,
        ExportComponent,
        PolygoneAttributesComponent,
        SquareSelectionAttributesComponent,
        CircleSelectionAttributesComponent,
        PenAttributesComponent,
        SprayAttributesComponent,
        TextComponent,
        StampAttributesComponent,
        MagnetismComponent,
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
    ],
    entryComponents: [UserGuideComponent, MainPageComponent],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
