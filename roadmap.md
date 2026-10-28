# Functional social network

- [x] Implement authentication, persistent sessions, logout and recovery forms; enable email, Google and Lovable.
- [x] Apply social schema, profile provisioning, RLS, uniqueness and timestamp/rate-limit guards.
- [x] Connect real feed, creation/editing, likes, comments, reports, filters and evaluations.
- [x] Verify public homepage, signed-out guards, six RLS flags, 12 security/constraint tests and preservation of 450 candidacies.
- [ ] Verify successful signup/profile trigger, login, logout, password recovery and persistence through authenticated UI — blocked: no auth users or session; reserved test email was rejected. Requires user signup and sign-in in preview.
- [ ] Verify common-user vs other-user permissions, duplicate constraints and rate limits with real authenticated accounts — same session blocker.