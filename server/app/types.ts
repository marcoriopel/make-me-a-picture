export const TYPES = {
    Server: Symbol('Server'),
    Application: Symbol('Application'),

    AuthController: Symbol('AuthController'),
    GamesController: Symbol('GamesController'),

    TokenService: Symbol('TokenService'),
    SocketService: Symbol('SocketService'),
    AuthService: Symbol('AuthService'),
    ChatManagerService: Symbol('ChatManagerService'),
    LobbyManagerService: Symbol('LobbyManagerService'),
    GameManagerService: Symbol('GameManagerService'),

    DatabaseModel: Symbol('DatabaseModel'),
    UserCredentialsModel: Symbol('UserCredentialsModel'),
    UserLogsModel: Symbol('UserLogsModel'),
};
