"""Regression test for the missing startup guard flagged in the 2026-07-11
platform audit — the app would boot in a non-local environment with the
checked-in default JWT secret still in place, letting anyone forge sessions.
"""

import pytest

from app.core import config


def test_refuses_default_secret_outside_local_environments(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(config.settings, "environment", "production")
    monkeypatch.setattr(config.settings, "jwt_secret_key", config._DEFAULT_JWT_SECRET)
    with pytest.raises(RuntimeError):
        config.guard_against_insecure_defaults()


def test_allows_default_secret_in_local_environment(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(config.settings, "environment", "local")
    monkeypatch.setattr(config.settings, "jwt_secret_key", config._DEFAULT_JWT_SECRET)
    config.guard_against_insecure_defaults()


def test_allows_production_with_custom_secret(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(config.settings, "environment", "production")
    monkeypatch.setattr(config.settings, "jwt_secret_key", "a-real-strong-secret-value")
    config.guard_against_insecure_defaults()
