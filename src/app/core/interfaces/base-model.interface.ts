export interface BaseModel {
    uuid: string;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    updated_by?: string;
    status?: number;
}