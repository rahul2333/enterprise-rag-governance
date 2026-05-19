from app.core.security import create_access_token, decode_access_token, hash_password, verify_password


def test_password_hash_and_verify() -> None:
    hashed = hash_password("StrongPass123!")
    assert hashed != "StrongPass123!"
    assert verify_password("StrongPass123!", hashed)


def test_jwt_round_trip() -> None:
    token = create_access_token("123", {"role": "admin"})
    payload = decode_access_token(token)
    assert payload["sub"] == "123"
    assert payload["role"] == "admin"
