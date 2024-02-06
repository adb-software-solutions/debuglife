import os
from typing import Any

from celery import Celery
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "epicbargainsanddeals.settings")

app = Celery("epicbargainsanddeals")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

app.conf.beat_schedule = {
    "create-pinterest-pins-task": {
        "task": "apps.shop.tasks.create_pinterest_pins_task",
        "schedule": 300,
    },
}

@app.task(bind=True)
def debug_task(self: Any) -> None:
    print(f"Request: {self.request!r}")
