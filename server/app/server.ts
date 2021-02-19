import * as http from 'http';
import { inject, injectable } from 'inversify';
import { Application } from './app';
import { TYPES } from './types';
import * as socketio from "socket.io";
import * as jwt from 'jsonwebtoken';
import { setTokenSourceMapRange } from 'typescript';
import { TokenService } from './services/token.service';

@injectable()
export class Server {
    private readonly appPort: string | number | boolean = this.normalizePort(process.env.PORT || '3000');
    private readonly baseDix: number = 10;
    private server: http.Server;

    constructor(
        @inject(TYPES.TokenService) private tokenService: TokenService,
        @inject(TYPES.Application) private application: Application) {
        this.tokenService = TokenService.getInstance();
    }

    init(): void {
        this.application.app.set('port', this.appPort);

        this.server = http.createServer(this.application.app);
        this.socketIoConfig();
        this.server.listen(this.appPort);
        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());
    }

    private socketIoConfig(): void {
        const io = new socketio.Server(this.server, ({ cors: { origin: "*" } }));

        io.on("connection", (socket: any) => {
            socket.on('message', (message: any) => {
                try {
                    if (!(message instanceof Object)) {
                        message = JSON.parse(message)
                    }
                    var user = jwt.verify(message.token, process.env.ACCES_TOKEN_SECRET);
                    
                    if (message.text) {​​​​
                        let date: Date = new Date();
                        let hours: string = date.getHours().toString().length == 1 ? "0" + date.getHours().toString() : date.getHours().toString();
                        let minutes: string = date.getMinutes().toString().length == 1 ? "0" + date.getMinutes().toString() : date.getMinutes().toString();
                        let seconds: string = date.getSeconds().toString().length == 1 ? "0" + date.getSeconds().toString() : date.getSeconds().toString();
                        let timeStamp: string = hours + ":" + minutes + ":" + seconds;
                        io.emit('message', {​​​​ "id": socket.id, "username": user, "text": message.text, "timeStamp":timeStamp, "textColor": "#000000" }​​​​);
                    }​​​​
                } catch (err) {
                    // err
                }
            });
        });
    }

    private normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, this.baseDix) : val;
        if (isNaN(port)) {
            return val;
        } else if (port >= 0) {
            return port;
        } else {
            return false;
        }
    }

    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof this.appPort === 'string' ? 'Pipe ' + this.appPort : 'Port ' + this.appPort;
        switch (error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Se produit lorsque le serveur se met à écouter sur le port.
     */
    private onListening(): void {
        const addr = this.server.address();
        // tslint:disable-next-line:no-non-null-assertion
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr!.port}`;
        // tslint:disable-next-line:no-console
        console.log(`Listening on ${bind}`);
    }
}
