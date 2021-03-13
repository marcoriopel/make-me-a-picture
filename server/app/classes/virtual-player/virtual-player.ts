import { Drawing } from '@app/ressources/interfaces/drawings.interface';
import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { Personnality, NB_PERSONNALITIES } from '@app/ressources/variables/virtual-player-variables'
import { DrawingsService } from '@app/services/drawings.service';
import { injectable } from 'inversify';
import { isBreakOrContinueStatement } from 'typescript';

@injectable()
export class VirtualPlayer {
    private personnality: number;
    private username: string;
    private avatar: number;
    private drawingsService: DrawingsService;
    private currentDrawing: Drawing;
    
    constructor() { 
        this.personnality = Math.floor(Math.random() * NB_PERSONNALITIES);
        this.setBasicUserInfo();
    }

    private setBasicUserInfo(){
        switch(this.personnality){
            case Personnality.NICE:
                this.username = "Bernard";
                this.avatar = 6;
                break;
            case Personnality.ANXIOUS:
                this.username = "Ginette";
                this.avatar = 7;
                break;
            case Personnality.PASSIVE_AGRESSIVE:
                this.username = "Kevin";
                this.avatar = 8;
                break;
            case Personnality.COMPETETIVE:
                this.username = "Émilio";
                this.avatar = 9;
                break;
        }
    }

    setDrawingsService(drawingsService: DrawingsService): void{
        this.drawingsService = drawingsService;
    }

    async getNewDrawing(difficulty: number): Promise<string>{
        try {
            this.currentDrawing = await this.drawingsService.getRandomDrawing(difficulty);
            return this.currentDrawing.drawingName;
        }
        catch(err){
            console.error(err)
        }
    }

    getBasicUser(): BasicUser{
        return {"username": this.username, "avatar": this.avatar}
    }
}