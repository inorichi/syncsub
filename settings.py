# Whether to run in debug mode
DEBUG = True

# Port to use
PORT = 8000

# Whether to use XSRF cookies
XSRF_COOKIES = False

# Secret cookie
SECRET_KEY = "secret!"

# Folder name to store app's subtitles (it must exist)
SUBTITLES_DIRNAME = 'data'

# Time in seconds to save subtitles' state (5 minutes by default)
SUBTITLES_SAVE_INTERVAL = 300


######## You shouldn't need to modify anything from here ########
import os

# Absolute filesystem path to the project
APP_ROOT = os.path.dirname(__file__)

# Absolute filesystem path to where subtitles are stored
SUBTITLES_DIR = os.path.join(APP_ROOT, SUBTITLES_DIRNAME)

# Tornado settings
TORNADO_SETTINGS = {
    "xsrf_cookies": XSRF_COOKIES,
    "cookie_secret": SECRET_KEY
}

# Django settings module to load
def get_django_settings(debug):
    return "syncsub.settings.dev" if debug else "syncsub.settings.production"

def set_from_django_settings():
    from django.conf import settings

    TORNADO_SETTINGS["login_url"] = settings.LOGIN_URL
    TORNADO_SETTINGS["static_path"] = settings.STATIC_ROOT
