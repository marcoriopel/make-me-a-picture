import { LoginController } from '@app/controllers/login.controller';
import { DatabaseModel } from '@app/models/database.model';
import { Container } from 'inversify';
import { Application } from './app';
import { Server } from './server';
import { ExistingUsersModel } from './models/existingUsers.model';
import { TYPES } from './types';

export const containerBootstrapper: () => Promise<Container> = async () => {
    const container: Container = new Container();

    container.bind(TYPES.Server).to(Server);
    container.bind(TYPES.Application).to(Application);

    container.bind(TYPES.LoginController).to(LoginController);
    container.bind(TYPES.DatabaseModel).to(DatabaseModel);
    container.bind(TYPES.ExistingUsersModel).to(ExistingUsersModel);
    return container;
};
const myContainer = new Container();

export { myContainer };
