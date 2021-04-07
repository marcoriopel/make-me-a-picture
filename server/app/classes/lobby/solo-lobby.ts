import { BasicUser, Player } from '@app/ressources/interfaces/user.interface';
import { GameType } from '@app/ressources/variables/game-variables';
import { injectable } from 'inversify';
import { VirtualPlayer } from '../virtual-player/virtual-player';
import { Lobby } from './lobby';

@injectable()
export class SoloLobby extends Lobby {
    private team: Map<string, Player> = new Map<string, Player>();
    private vPlayer: VirtualPlayer;

    constructor(difficulty: number, gameName: string, id: string, isPrivate: boolean) {
        super(difficulty, gameName, id, isPrivate);
        this.gameType = GameType.SOLO;
        this.vPlayer = this.generateRandomVPlayer();
        console.log("Created solo game lobby with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    startGame(): void { }

    deleteLobby(): void { }

    addPlayer(user: BasicUser, socketId: string): void {
        if (this.team.size) {
            throw new Error("You have already joined this lobby");
        }
        const player: Player = {
            "username": user.username,
            "avatar": user.avatar,
            "isVirtual": false,
            "socketId": socketId,
        }
        this.team.set(user.username, player);
    }

    getPlayers(): any {
        let players = [];
        this.team.forEach((player: Player) => {
            players.push({ "username": player.username, "avatar": player.avatar, "team": 0, "isVirtual": player.isVirtual });
        })
        return players;
    }

    removePlayer(user: BasicUser): void {
        if (this.team.has(user.username)) {
            this.team.delete(user.username);
            return
        }
        throw new Error("You are not part of this lobby")
    }

    getVPlayer(): VirtualPlayer {
        return this.vPlayer;
    }
}