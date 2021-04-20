import { AuthController } from '@app/controllers/auth.controller';
import { GamesController } from '@app/controllers/games.controller';
import { DrawingsController } from '@app/controllers/drawings.controller';
import { ChatController } from '@app/controllers/chat.controller';
import { DatabaseModel } from '@app/models/database.model';
import { Container } from 'inversify';
import { Application } from './app';
import { Server } from './server';
import { UsersModel } from './models/users.model';
import { UserLogsModel } from './models/user-logs.model';
import { DrawingsModel } from './models/drawings.model';
import { ChatModel } from './models/chat.model';
import { TYPES } from './types';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { SocketService } from './services/sockets/socket.service';
import { ChatManagerService } from './services/managers/chat-manager.service';
import { LobbyManagerService } from './services/managers/lobby-manager.service';
import { GameManagerService } from './services/managers/game-manager.service';
import { DrawingsService } from './services/drawings.service';
import { SocketConnectionService } from './services/sockets/socket-connection.service';
import { UserService } from './services/user.service';
import { StatsController } from './controllers/stats.controller';
import { StatsService } from './services/stats.service';
import { GamesModel } from './models/games.model';

export const containerBootstrapper: () => Promise<Container> = async () => {
    const container: Container = new Container();

    container.bind(TYPES.Server).to(Server);
    container.bind(TYPES.Application).to(Application);

    container.bind(TYPES.AuthController).to(AuthController);
    container.bind(TYPES.StatsController).to(StatsController);
    container.bind(TYPES.GamesController).to(GamesController);
    container.bind(TYPES.DrawingsController).to(DrawingsController);
    container.bind(TYPES.ChatController).to(ChatController);

    container.bind(TYPES.TokenService).to(TokenService);
    container.bind(TYPES.SocketService).to(SocketService);
    container.bind(TYPES.SocketConnectionService).to(SocketConnectionService);
    container.bind(TYPES.AuthService).to(AuthService);
    container.bind(TYPES.UserService).to(UserService);
    container.bind(TYPES.ChatManagerService).to(ChatManagerService);
    container.bind(TYPES.LobbyManagerService).to(LobbyManagerService);
    container.bind(TYPES.GameManagerService).to(GameManagerService);
    container.bind(TYPES.DrawingsService).to(DrawingsService);
    container.bind(TYPES.StatsService).to(StatsService);


    container.bind(TYPES.DatabaseModel).to(DatabaseModel);
    container.bind(TYPES.DrawingsModel).to(DrawingsModel);
    container.bind(TYPES.ChatModel).to(ChatModel);
    container.bind(TYPES.UsersModel).to(UsersModel);
    container.bind(TYPES.UserLogsModel).to(UserLogsModel);
    container.bind(TYPES.GamesModel).to(GamesModel);
    return container;
};
const myContainer = new Container();

export { myContainer };
