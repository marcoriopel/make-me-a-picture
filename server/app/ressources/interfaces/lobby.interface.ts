export interface Lobby {
    id: string;
    gameName: string;
    gameType: number;
    difficulty: number;
}

export function validateLobby(element: any): boolean{
    if ( 
        (element.id && typeof element.id != 'string') || 
        (element.gameName && typeof element.gameName != 'string') || 
        (element.gameType && typeof element.gameType != 'number') || 
        (element.difficulty && typeof element.difficulty != 'number')
    ){
        return false;
    }
    return true
}
