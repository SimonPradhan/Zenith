import resend

from app.core.config import settings


resend.api_key = settings.resend_api_key


def send_verification_email(
    recipient_email: str,
    recipient_name: str,
    verification_url: str,
) -> None:
    if settings.environment.lower() == "test":
        return

    resend.Emails.send(
        {
            "from": "Zenith <no-reply@zenith.simonpradhan.com.np>",
            "to": [recipient_email],
            "subject": "Verify your Zenith account",
            "html": f"""
                <h2>Welcome to Zenith, {recipient_name}!</h2>
                <p>
                    Thanks for creating your account.
                    Please verify your email address to continue.
                </p>
                <p>
                    <a href="{verification_url}">
                        Verify your email address
                    </a>
                </p>
                <p>
                    This verification link will expire in 24 hours.
                </p>
                <p>
                    If you didn't create a Zenith account,
                    you can safely ignore this email.
                </p>
            """,
        }
    )


def send_password_reset_email(
    recipient_email: str,
    recipient_name: str,
    reset_url: str,
) -> None:
    if settings.environment.lower() == "test":
        return

    resend.Emails.send(
        {
            "from": "Zenith <no-reply@zenith.simonpradhan.com.np>",
            "to": [recipient_email],
            "subject": "Reset your Zenith password",
            "html": f"""
                <h2>Password reset request</h2>

                <p>
                    Hi {recipient_name},
                </p>

                <p>
                    We received a request to reset your Zenith password.
                </p>

                <p>
                    <a href="{reset_url}">
                        Reset your password
                    </a>
                </p>

                <p>
                    This password reset link will expire in 1 hour.
                </p>

                <p>
                    If you didn't request a password reset,
                    you can safely ignore this email.
                </p>
            """,
        }
    )
