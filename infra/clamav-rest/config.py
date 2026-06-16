import os


DEFAULT_MAX_CONTENT_LENGTH = 15 * 1024 * 1024  # 15 Mb


class BaseConfig(object):
    DEBUG = False
    TESTING = False
    APPLICATION_USERS = os.environ.get("APPLICATION_USERS", {})
    SENTRY_DSN = os.environ.get("SENTRY_DSN", "")
    CLAMAV_TXT_URI = "current.cvd.clamav.net"
    CLAMD_HOST = "localhost"
    CLAMD_PORT = 3310
    HOST = "0.0.0.0"
    PORT = int(os.environ.get("PORT", "8090"))
    MAX_CONTENT_LENGTH = int(
        os.environ.get("MAX_CONTENT_LENGTH", DEFAULT_MAX_CONTENT_LENGTH)
    )


class ProductionConfig(BaseConfig):
    CLAMD_SOCKET = os.environ.get("CLAMD_SOCKET", "/app/run/clamd.sock")
    # CLAMD_HOST = os.environ.get("CLAMD_HOST", "clamav")


class CiConfig(BaseConfig):
    CLAMD_HOST = "localhost"
    DEBUG = True
    TESTING = True
    # pwd: letmein
    APPLICATION_USERS = "app1::$pbkdf2-sha256$29000$LiWkFELo3TvHGANACAGAkA$Re51NLQNiCYy0UAdnFbNfLltFDmiJOOzqjMPFRVBgMM"  # noqa


class LocalConfig(CiConfig):
    pass


class TestConfig(BaseConfig):
    DEBUG = True
    TESTING = True
    # pwd: letmein
    APPLICATION_USERS = "app1::$pbkdf2-sha256$29000$LiWkFELo3TvHGANACAGAkA$Re51NLQNiCYy0UAdnFbNfLltFDmiJOOzqjMPFRVBgMM"  # noqa
    CLAMD_HOST = "clamd"
    MAX_CONTENT_LENGTH = DEFAULT_MAX_CONTENT_LENGTH
