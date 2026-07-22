FROM python:3.12-slim

# Définir le répertoire de travail directement sur le dossier contenant app.py
WORKDIR /app

# Copier tout le projet
COPY . .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Exposer le port
EXPOSE 5000

# Variables d'environnement Flask
ENV FLASK_APP=app/app.py
ENV FLASK_RUN_HOST=0.0.0.0
# app.py tourne avec debug=True (rechargement automatique), ce qui désactive
# /metrics par défaut dans prometheus_flask_exporter ; on le réactive ici.
ENV DEBUG_METRICS=1

# Lancer Flask
CMD ["python", "app/app.py"]
