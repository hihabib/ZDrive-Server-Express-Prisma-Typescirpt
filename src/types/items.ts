export interface TFile {
    fileId: string
    fileName: string
}

export interface TDirectory {
    dirId: string
    dirName: string
}

export type TCurrentPageItems = Record<string, {
    currentDirId: string
    currentDirName: string
    totalItems: number
    files: Record<string, TFile>
    directories: Record<string, TDirectory>
}>
export type TItems = {
    files?: string[]
    directories?: string[]
}
export type TDirRef = {
    id: number
}
