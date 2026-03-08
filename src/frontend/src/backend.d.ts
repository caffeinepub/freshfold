import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Booking {
    id: bigint;
    serviceType: ServiceType;
    name: string;
    pickupDate: string;
    address: string;
    timestamp: bigint;
    numClothes: bigint;
    phone: string;
}
export enum ServiceType {
    washFold = "washFold",
    washIron = "washIron",
    dryCleaning = "dryCleaning",
    expressLaundry = "expressLaundry",
    blanketBedsheet = "blanketBedsheet"
}
export interface backendInterface {
    getAdminBookings(password: string): Promise<Array<Booking> | null>;
    getAllBookings(): Promise<Array<Booking>>;
    getBooking(id: bigint): Promise<Booking | null>;
    submitBooking(name: string, phone: string, address: string, pickupDate: string, serviceType: ServiceType, numClothes: bigint): Promise<bigint>;
}
