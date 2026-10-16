# Persistent browser sessions

Zenith's browser authentication uses a short-lived bearer access token and a rotating, opaque refresh token stored in an `HttpOnly` cookie.

## Behavior

- Access tokens expire after 15 minutes.
- Refresh sessions slide forward up to 30 days after use, with a 90-day absolute limit.
- Refresh tokens are random opaque values. Only their SHA-256 hashes are stored in PostgreSQL.
- Refreshing rotates the token; the previous token is revoked.
- Logout revokes the current refresh session.
- Password reset revokes all refresh sessions for the account.
- The browser restores its access token from the refresh cookie when the workspace loads.

## Apply the migration

From the backend virtual environment and `backend` directory:

```bash
alembic upgrade head
```

Back up your database before applying migrations in a production environment.

## Cookie configuration

Local development defaults to `HttpOnly`, `SameSite=Lax`, and a non-secure cookie for localhost HTTP.

For a production deployment using HTTPS, set:

```env
ENVIRONMENT=production
REFRESH_COOKIE_SECURE=true
REFRESH_COOKIE_SAMESITE=none
```

`SameSite=None` is required when the frontend and API are hosted on different sites; browsers require `Secure` for that setting. Configure `FRONTEND_URL` to the exact trusted frontend origin. If hosting both services under a shared parent domain and same-site deployment, `SameSite=Lax` may be preferable.

If you use a cookie domain, configure `REFRESH_COOKIE_DOMAIN` only for a domain you control and intend to share across.

## Verify locally

```bash
pytest test/test_auth.py test/test_sessions.py
```

The test database must be configured through the existing `.env.test` settings and migrated to the current Alembic head first.
