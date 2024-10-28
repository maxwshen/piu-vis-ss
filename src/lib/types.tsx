

// [panel, time, limbAnnot]
export type ArrowArt = [number, number, string];

// [panel, startTime, endTime, limbAnnot]
export type HoldArt = [number, number, number, string];
export type ChartArt = [ArrowArt[], HoldArt[]];