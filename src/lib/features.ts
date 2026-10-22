/**
 * What is actually built. The homepage and navigation read this, so nothing is advertised as
 * working before it is. Flip a status only when the feature works end to end.
 */
export type FeatureStatus = 'available' | 'soon'

export interface Feature {
  key: string
  title: string
  description: string
  status: FeatureStatus
  to?: string
}

export const FEATURES: Feature[] = [
  {
    key: 'learn',
    title: 'Learn',
    description:
      'Plain-language guides on smart-home basics, devices, installation, security, troubleshooting and automations.',
    status: 'available',
    to: '/learn',
  },
  {
    key: 'home',
    title: 'My home & devices',
    description: 'Record your rooms and devices, with purchase dates, warranty expiry and notes, in one place.',
    status: 'soon',
  },
  {
    key: 'planner',
    title: 'Smart-home planner',
    description: 'A rule-based planner that turns your budget and goals into a shopping list. Not AI.',
    status: 'soon',
  },
  {
    key: 'care',
    title: 'SmartNest Care',
    description: 'Raise a support ticket for a device and follow every update in a timeline.',
    status: 'soon',
  },
]
