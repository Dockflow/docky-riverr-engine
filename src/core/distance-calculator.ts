import { Point } from '../types/docky-shipment-status-types';

export class DistanceCalculator {
    public static distanceinKilometers(point1: Point, point2: Point): number {
        const p = 0.017453292519943295; // Math.PI / 180
        const c = Math.cos;
        const a =
            0.5 -
            c((point2.coordinates[1] - point1.coordinates[1]) * p) / 2 +
            (c(point1.coordinates[1] * p) *
                c(point2.coordinates[1] * p) *
                (1 - c((point2.coordinates[0] - point1.coordinates[0]) * p))) /
                2;

        return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    }
}
