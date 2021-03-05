import { BasicUser, Player } from '@app/ressources/interfaces/user.interface';
import { GameType } from '@app/ressources/variables/game-variables';
import { injectable } from 'inversify';
import { VirtualPlayer } from '../virtual-player/virtual-player';
import { Lobby } from './lobby';

@injectable()
export class ClassicLobby extends Lobby {
    private teams: Map<string, number>[] = [new Map<string, number>(), new Map<string, number>()];
    private vPlayers: VirtualPlayer[] = new Array(2);

    constructor(difficulty: number, gameName: string) {
        super(difficulty, gameName);
        this.gameType = GameType.CLASSIC;
        console.log("Created classic game lobby with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    startGame(): void { }

    deleteLobby(): void { }

    addPlayer(user: BasicUser): void {
        if (this.isUserInLobby(user)) {
            throw new Error("You have already joined this lobby");
        }
        if (this.isLobbyFull()) {
            throw new Error("Lobby is full");
        }

        if (this.teams[0].size <= this.teams[1].size) {
            this.teams[0].set(user.username, Number(user.avatar));
        }
        else {
            this.teams[1].set(user.username, Number(user.avatar));
        }
    }

    addVirtualPlayer(teamNumber: number): void {
        if (this.isLobbyFull()) {
            throw new Error("Lobby is full");
        }
        let vPlayerIsUnique: boolean = false;
        let tempVPlayer: VirtualPlayer;
        while (!vPlayerIsUnique) {
            tempVPlayer = new VirtualPlayer();
            if (!this.isUserInLobby(tempVPlayer.getBasicUser())) {
                vPlayerIsUnique = true;
            }
        }
        if (this.teams[teamNumber].size < 2 && this.vPlayers[teamNumber] == undefined) {
            this.vPlayers[teamNumber] = tempVPlayer;
            const tempVPlayerBasicInfo: BasicUser = tempVPlayer.getBasicUser();
            this.teams[teamNumber].set(tempVPlayerBasicInfo.username, tempVPlayerBasicInfo.avatar)
        }
        else {
            throw new Error("No more virtual players can be added to this team");
        }
    }

    removeVirtualPlayer(teamNumber: number, username: string): void {
        if (this.teams[teamNumber].delete(username)) {
            this.vPlayers[teamNumber] = undefined;
        }
        else {
            throw new Error("Virtual player not found");
        }
    }

    getPlayers(): any {
        let players = [];
        for (let i = 0; i < this.teams.length; ++i) {
            this.teams[i].forEach((avatar: number, username: string, map: Map<string, number>) => {
                const player: Player = { "username": username, "avatar": avatar, "team": i, "isVirtual": avatar > 6 }
                players.push(player);
            })
        }
        return players;
    }

    removePlayer(): void { }

    private isUserInLobby(user: BasicUser): boolean {
        return this.teams[0].has(user.username) || this.teams[1].has(user.username);
    }

    private isLobbyFull(): boolean {
        return this.teams[0].size == 2 && this.teams[1].size == 2;
    }
}