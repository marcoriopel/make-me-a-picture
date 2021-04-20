
export function formatDateString(timestamp: number): string {

    let date = new Date(timestamp);
    let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let month = date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth();
    let year = date.getFullYear();
    let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

    let formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
}

export function formatTimePlayed(timestamp: number): string {
    timestamp = Math.floor(timestamp / 1000);
    let hours = Math.floor(timestamp / 3600);
    let minutes = Math.floor((timestamp / 60) % 60);
    return `${hours}H${minutes}M`;
}

export function formatMeanTimePlayed(timestamp: number): string {
    timestamp = Math.floor(timestamp / 1000);
    let minutes = Math.floor((timestamp / 60) % 60);
    let seconds = Math.floor(timestamp % 60);
    return `${minutes}M${seconds}S`;
}