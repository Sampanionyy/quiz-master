FROM python:3.12-slim

# Définir le répertoire de travail directement sur le dossier contenant app.py
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY app/ ./app/

# Utilisateur non-root pour exécuter le conteneur
RUN groupadd --system appuser \
    && useradd --system --gid appuser --no-create-home appuser \
    && chown -R appuser:appuser /app
USER appuser

# Exposer le port
EXPOSE 5000

# Un seul worker gunicorn multi-threads 
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--threads", "4", "app.app:app"]
