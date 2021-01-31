export const MAXIMUM_RGBA_VALUE = 255;
export const RGBA_LENGTH = 4;

export interface Rgba {
    RED: number;
    GREEN: number;
    BLUE: number;
    ALPHA: number;
}

export const RGBA_INDEXER: Rgba = {
    RED: 0,
    GREEN: 1,
    BLUE: 2,
    ALPHA: 3,
};
