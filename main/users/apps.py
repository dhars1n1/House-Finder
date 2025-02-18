from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'  # Replace with your actual app name

    def ready(self):
        import users.signals  # Import signals when the app is ready
