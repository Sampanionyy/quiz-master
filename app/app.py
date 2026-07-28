from flask import Flask, render_template, jsonify
from prometheus_flask_exporter import PrometheusMetrics
import secrets
import sys
import os

# Ajouter le dossier parent au PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import des blueprints depuis le dossier routes
from routes.students import students_bp
from routes.subjects import subjects_bp
from routes.students_subjects import students_subjects_bp
from routes.quiz import quiz_bp

# Créer l'application Flask
app = Flask(__name__, template_folder="templates")

# Configuration pour les sessions (nécessaire pour le quiz)
secret_key = os.environ.get('SECRET_KEY')
if not secret_key:
    secret_key = secrets.token_hex(32)
    app.logger.warning(
        "SECRET_KEY n'est pas définie dans l'environnement : une clé aléatoire "
        "a été générée pour ce processus. Les sessions existantes seront invalidées "
        "à chaque redémarrage. Définissez SECRET_KEY en production."
    )
app.config['SECRET_KEY'] = secret_key

# Expose les métriques Prometheus sur /metrics
metrics = PrometheusMetrics(app)

# Enregistrer les blueprints
app.register_blueprint(students_bp, url_prefix='/students')
app.register_blueprint(subjects_bp, url_prefix='/subjects')
app.register_blueprint(students_subjects_bp, url_prefix='/students-subjects')
app.register_blueprint(quiz_bp)

# Route racine - Page d'accueil moderne
@app.route('/')
def home():
    return render_template('home.html')

# Probe de santé Kubernetes 
@app.route('/healthz')
def healthz():
    return jsonify(status="ok"), 200

# Lancer le serveur
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)