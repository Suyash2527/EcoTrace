import { useAnnouncer as useAnnouncerInternal } from '../components/a11y/LiveRegion';

export function useAnnouncer() {
  return useAnnouncerInternal();
}
