/**
 * Shared authentication helper.
 * 
 * Currently returns a demo user ID. When NextAuth.js is integrated,
 * this should extract the authenticated user from the request
 * (session cookie, Authorization header, etc.).
 */
export const DEMO_USER_ID = 'user_demo_001'

// In production, this would validate a session/token:
// export async function getCurrentUserId(request: NextRequest): Promise<string> {
//   const session = await getServerSession(authOptions)
//   if (!session?.user?.id) throw new AuthError('Unauthorized')
//   return session.user.id
// }
