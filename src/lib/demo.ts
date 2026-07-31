/**
 * Demo/auth-skip flag.
 *
 * This was used for temporary, anonymous browsing while building.
 * It is now disabled so real product pages always require sign-in to access
 * progress-dependent functionality.
 */
export function isDemoSkipAuth(): boolean {
  return false;
}
