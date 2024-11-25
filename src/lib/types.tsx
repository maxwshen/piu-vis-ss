

// [panel, time, limbAnnot]
export type ArrowArt = [number, number, string];

// [startTime, endTime, nTicks]
export type HoldTick = [number, number, number];

// [panel, startTime, endTime, limbAnnot]
export type HoldArt = [number, number, number, string];
export type ChartArt = [ArrowArt[], HoldArt[], any];

export type Segment = [number, number, number, number];
