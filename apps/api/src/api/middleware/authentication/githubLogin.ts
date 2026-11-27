import passport from 'passport';

// Redirects to GitHub's consent screen.
export default passport.authenticate('github', { session: false });
