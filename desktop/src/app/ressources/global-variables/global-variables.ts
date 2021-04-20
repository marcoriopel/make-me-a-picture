// Global variables are stored here
export const MINIMUM_CANVAS_WIDTH = 800;
export const MINIMUM_CANVAS_HEIGHT = 547;
export const MINIMUM_WORKSPACE_WIDTH = 1200;
export const MINIMUM_WORKSPACE_HEIGHT = 820;
export const TOOLTIP_DELAY = 500;
export const MAXIMUM_NUMBER_OF_COLORS = 10;
export const MAX_OPACITY = 100;
export const MAX_TOOL_WIDTH = 50;
export const MIN_TOOL_WIDTH = 1;
export const MIN_ERASER_TOOL_WIDTH = 5;
export const MAX_BORDER = 20;
export const MIN_BORDER = 1;
export const MAX_PERCENTAGE = 100;
export const MIN_GRID_SQUARE_SIZE = 5;
export const MAX_GRID_SQUARE_SIZE = 200;
export const MIN_GRID_OPACITY = 10;
export const MAX_GRID_OPACITY = 100;
export const DEFAULT_GRID_SIZE = 20;
export const GRID_STEP = 5;

export const DEFAULT_GRID_OPACITY = 100;
export const TWO_DECIMAL_MULTIPLIER = 100;

export const MIN_LINE_WIDTH = 1;
export const MAX_LINE_WIDTH = 100;
export const LINE_WIDTH_STEP = 1;
export const INITIAL_LINE_WIDTH = 10;

export const BLACK = '#000000';
export const WHITE = '#FFFFFF';
export const RED = '#EB5757';
export const ORANGE = '#F2994A';
export const YELLOW = '#F2C94C';
export const DARK_GREEN = '#219653';
export const LIGHT_GREEN = '#27AE60';
export const DARK_BLUE = '#2F80ED';
export const LIGHT_BLUE = '#2D9CDB';
export const TURQUOISE = '#56CCF2';
export const PURPLE = '#9B51E0';
export const PINK = '#BB6BD9';
export const DARK = '#231F20';
export const POLY_RED = '#BA2034';



export enum MouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
    BACK = 3,
    FORWARD = 4,
}

export enum State {
    GAMESTART = 0,
    REPLY = 1,
    NEWROUND = 2,
    ENDGAME = 3,
    MAXSCORE = 4,
    SPRINTSTART = 5,
}

export enum LeaderboardCategory {
    MOST_GAMES_PLAYED = 0,
    MOST_CLASSIC_GAMES_WON = 1,
    MOST_TIME_PLAYED = 2,
    BEST_SOLO_SCORE = 3,
    BEST_COOP_SCORE = 4,
    BEST_CLASSIC_WIN_RATIO = 5,
    MOST_UPVOTES = 6
}