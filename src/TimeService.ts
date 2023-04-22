export interface TimeService {
  now: () => Date;
}

export const localTimeService: TimeService = {
  now: () => new Date(),
};
