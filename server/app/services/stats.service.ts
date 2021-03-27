import { UsersModel } from '@app/models/users.model';
import { UserLogsModel } from '@app/models/user-logs.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { GamesModel } from '@app/models/games.model';
import { BasicUser } from '@app/ressources/interfaces/user.interface';

@injectable()
export class StatsService {

    constructor(
        @inject(TYPES.UsersModel) private usersModel: UsersModel,
        @inject(TYPES.UserLogsModel) private userLogsModel: UserLogsModel,
        @inject(TYPES.GamesModel) private gamesModel: GamesModel ){
    }

    saveGame(gameName: string, gameType: number, players: any, score: any, startDate: number, endDate: number){
        this.gamesModel.setGameInfo(gameName, gameType, players, score, startDate, endDate)
    }

}