import { Personnality } from '@app/ressources/variables/virtual-player-variables';
import { injectable } from 'inversify';
import { VirtualPlayer } from './virtual-player';

@injectable()
export class VirtualPlayerAnxious extends VirtualPlayer {
    
    constructor(gameId: string) {
        super(gameId);
        this.personnality = Personnality.ANXIOUS;
        this.username = "Ginette";
        this.avatar = 7;
    }
}