import shlex
import subprocess
from typing import Any, Dict

from django.core.management.base import BaseCommand
from django.utils import autoreload


def restart_celery() -> None:
    subprocess.call(shlex.split('pkill -f "celery worker"'))
    subprocess.call(shlex.split("celery -A debuglife worker -l INFO"))


class Command(BaseCommand):
    def handle(self, *args: Any, **kwargs: Dict[str, Any]) -> None:
        print("Starting celery worker with autoreload...")
        autoreload.run_with_reloader(restart_celery)
