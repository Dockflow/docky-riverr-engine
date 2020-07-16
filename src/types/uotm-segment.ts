import { UOTMChangedETASegment } from './uotm-changed-eta-segment';
import { UOTMContainerMilestonesSegment } from './uotm-container-milestones-segment';
import { UOTMTUDDSegment } from './uotm-tudd-segment';

export type UOTMSegment = UOTMTUDDSegment | UOTMChangedETASegment | UOTMContainerMilestonesSegment;
