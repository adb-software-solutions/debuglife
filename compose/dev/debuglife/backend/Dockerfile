# Pull base image
FROM ubuntu:24.04

# Set environment variables
ENV PIP_DISABLE_PIP_VERSION_CHECK 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV BLIS_ARCH=generic

# Install packages
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y \
    python3.12 \
    python3-pip \
    python3.12-venv \
    python3.12-dev \
    build-essential \
    libpq-dev \
    gcc \
    wget \
    autoconf \
    automake \
    pkg-config \
    libtool \
    procps \
    libffi-dev


RUN python3.12 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies
COPY ./requirements/dev.txt /requirements.txt
RUN pip install -r requirements.txt

RUN python3.12 -m spacy download en_core_web_sm

# Copy project files
COPY ./compose/dev/debuglife/backend/entrypoint /entrypoint
RUN chmod +x /entrypoint

COPY ./compose/dev/debuglife/backend/start /start
RUN chmod +x /start

COPY ./compose/dev/debuglife/celery/worker/start /start-celeryworker
RUN chmod +x /start-celeryworker

COPY ./compose/dev/debuglife/celery/beat/start /start-celerybeat
RUN chmod +x /start-celerybeat

COPY ./compose/dev/debuglife/celery/flower/start /start-flower
RUN chmod +x /start-flower

# Expose port
EXPOSE 8000

# Set working directory
WORKDIR /opt/debuglife

ENTRYPOINT [ "/entrypoint" ]