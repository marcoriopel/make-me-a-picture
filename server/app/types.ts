export const TYPES = {
    Server: Symbol('Server'),
    Application: Symbol('Application'),

    AuthController: Symbol('AuthController'),
    StatsController: Symbol('StatsController'),
    GamesController: Symbol('GamesController'),
    ChatController: Symbol('ChatController'),
    DrawingsController: Symbol('DrawingsController'),

    TokenService: Symbol('TokenService'),
    SocketService: Symbol('SocketService'),
    SocketConnectionService: Symbol('SocketConnectionService'),
    AuthService: Symbol('AuthService'),
    UserService: Symbol('UserService'),
    ChatManagerService: Symbol('ChatManagerService'),
    LobbyManagerService: Symbol('LobbyManagerService'),
    GameManagerService: Symbol('GameManagerService'),
    DrawingsService: Symbol('DrawingsService'),
    StatsService: Symbol('StatsService'),

    DatabaseModel: Symbol('DatabaseModel'),
    ChatModel: Symbol('ChatModel'),
    DrawingsModel: Symbol('DrawingsModel'),
    UsersModel: Symbol('UsersModel'),
    UserLogsModel: Symbol('UserLogsModel'),
    GamesModel: Symbol('GamesModel'),
};
