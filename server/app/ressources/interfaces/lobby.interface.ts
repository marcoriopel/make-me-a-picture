export interface LobbyCreation {
    gameName: string;
    gameType: number;
    difficulty: number;
}

export function validateLobbyCreation(element: any): boolean{
    if ( 
        (element.gameName && typeof element.gameName != 'string') || 
        (element.gameType && typeof element.gameType != 'number') || 
        (element.difficulty && typeof element.difficulty != 'number')
    ){
        return false;
    }
    return true
}
