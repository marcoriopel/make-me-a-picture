import { Personnality } from '@app/ressources/variables/virtual-player-variables';
import { injectable } from 'inversify';
import { VirtualPlayer } from './virtual-player';

@injectable()
export class VirtualPlayerCompetitive extends VirtualPlayer {
    
    constructor(gameId: string) {
        super(gameId);
        this.personnality = Personnality.COMPETITIVE;
        this.username = "Émilio";
        this.avatar = 9;
    }
}