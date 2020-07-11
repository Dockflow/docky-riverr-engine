import { UOTMChangedETASegment } from './uotm-changed-eta-segment';
import { UOTMTUDDSegment } from './uotm-tudd-segment';

export type UOTMSegment = UOTMTUDDSegment | UOTMChangedETASegment;
